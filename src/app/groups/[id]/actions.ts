'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createExpense(groupId: string, data: {
  description: string,
  totalAmount: number,
  payerId: string,
  splitType: string,
  splits: Record<string, number>
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) throw new Error("Unauthorized");

  const { description, totalAmount, payerId, splitType, splits } = data;

  const exactOwed: Record<string, number> = {};

  if (splitType === 'EQUAL') {
    const participants = Object.keys(splits);
    const baseShare = Math.floor((totalAmount / participants.length) * 100) / 100;
    let totalAssigned = 0;
    participants.forEach(id => {
      exactOwed[id] = baseShare;
      totalAssigned += baseShare;
    });
    const diff = Math.round((totalAmount - totalAssigned) * 100) / 100;
    if (diff !== 0) {
      if (exactOwed[payerId] !== undefined) {
        exactOwed[payerId] += diff;
      } else {
        exactOwed[participants[0]] += diff;
      }
    }
  } else if (splitType === 'UNEQUAL') {
    Object.entries(splits).forEach(([id, amt]) => {
      exactOwed[id] = amt;
    });
  } else if (splitType === 'PERCENTAGE') {
    let totalAssigned = 0;
    const entries = Object.entries(splits);
    entries.forEach(([id, pct]) => {
      const share = Math.floor((totalAmount * (pct / 100)) * 100) / 100;
      exactOwed[id] = share;
      totalAssigned += share;
    });
    const diff = Math.round((totalAmount - totalAssigned) * 100) / 100;
    if (diff !== 0) {
      if (exactOwed[payerId] !== undefined) {
        exactOwed[payerId] += diff;
      } else {
        exactOwed[entries[0][0]] += diff;
      }
    }
  } else if (splitType === 'SHARE') {
    const totalShares = Object.values(splits).reduce((a, b) => a + b, 0);
    let totalAssigned = 0;
    const entries = Object.entries(splits);
    entries.forEach(([id, shareCount]) => {
      const share = Math.floor((totalAmount * (shareCount / totalShares)) * 100) / 100;
      exactOwed[id] = share;
      totalAssigned += share;
    });
    const diff = Math.round((totalAmount - totalAssigned) * 100) / 100;
    if (diff !== 0) {
      if (exactOwed[payerId] !== undefined) {
        exactOwed[payerId] += diff;
      } else {
        exactOwed[entries[0][0]] += diff;
      }
    }
  }

  await prisma.expense.create({
    data: {
      groupId,
      description,
      totalAmount,
      payerId,
      splitType,
      participants: {
        create: Object.entries(exactOwed).map(([id, amountOwed]) => ({
          userId: id,
          amountOwed: Math.round(amountOwed * 100) / 100
        }))
      }
    }
  });

  revalidatePath(`/groups/${groupId}`);
}

export async function createSettlement(groupId: string, data: { payerId: string, payeeId: string, amount: number }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) throw new Error("Unauthorized");

  await prisma.settlement.create({
    data: {
      groupId,
      ...data
    }
  });
  revalidatePath(`/groups/${groupId}`);
}
