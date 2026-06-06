'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function sendMessage(expenseId: string, content: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const msg = await prisma.message.create({
    data: {
      expenseId,
      userId,
      content
    },
    include: { user: { select: { id: true, name: true } } }
  });

  return {
    ...msg,
    createdAt: msg.createdAt.toISOString()
  };
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
