'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function sendMessage(expenseId: string, content: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) throw new Error("Unauthorized");

  await prisma.message.create({
    data: {
      expenseId,
      userId,
      content
    }
  });
}

export async function getMessages(expenseId: string, afterDateStr?: string) {
  const whereClause: any = { expenseId };
  if (afterDateStr) {
    whereClause.createdAt = { gt: new Date(afterDateStr) };
  }

  const messages = await prisma.message.findMany({
    where: whereClause,
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' }
  });

  return messages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString()
  }));
}
