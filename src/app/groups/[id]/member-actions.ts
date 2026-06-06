'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function addMemberToGroup(groupId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Check if already a member
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } }
  });
  if (existing) return;

  await prisma.groupMember.create({
    data: { groupId, userId }
  });
  revalidatePath(`/groups/${groupId}`);
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Safety Check: Verify user has NO history in this group
  const asPayer = await prisma.expense.count({ where: { groupId, payerId: userId } });
  
  const asParticipant = await prisma.expenseParticipant.count({ 
    where: { userId, expense: { groupId } } 
  });

  const asSettlementPayer = await prisma.settlement.count({ where: { groupId, payerId: userId } });
  const asSettlementPayee = await prisma.settlement.count({ where: { groupId, payeeId: userId } });

  if (asPayer > 0 || asParticipant > 0 || asSettlementPayer > 0 || asSettlementPayee > 0) {
    throw new Error("Cannot remove user: they have active expense or settlement history in this group.");
  }

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } }
  });
  revalidatePath(`/groups/${groupId}`);
}
