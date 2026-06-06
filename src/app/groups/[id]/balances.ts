import { prisma } from "@/lib/prisma"

export type Debt = {
  from: { id: string, name: string },
  to: { id: string, name: string },
  amount: number
}

export async function calculateBalances(groupId: string): Promise<Debt[]> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: true } },
      expenses: { include: { participants: true } },
      settlements: true
    }
  });

  if (!group) return [];

  const balances: Record<string, number> = {};
  const users: Record<string, { id: string, name: string }> = {};

  group.members.forEach(m => {
    balances[m.user.id] = 0;
    users[m.user.id] = m.user;
  });

  // Calculate Net Balances
  group.expenses.forEach(exp => {
    if (balances[exp.payerId] !== undefined) {
      balances[exp.payerId] += exp.totalAmount;
    }
    exp.participants.forEach(p => {
      if (balances[p.userId] !== undefined) {
        balances[p.userId] -= p.amountOwed;
      }
    });
  });

  group.settlements.forEach(settle => {
    if (balances[settle.payerId] !== undefined) {
      balances[settle.payerId] += settle.amount;
    }
    if (balances[settle.payeeId] !== undefined) {
      balances[settle.payeeId] -= settle.amount;
    }
  });

  // Greedy Algorithm
  const debts: Debt[] = [];

  const debtors = Object.entries(balances)
    .filter(([_, bal]) => bal < -0.005)
    .map(([id, bal]) => ({ id, bal: -bal }))
    .sort((a, b) => b.bal - a.bal);

  const creditors = Object.entries(balances)
    .filter(([_, bal]) => bal > 0.005)
    .map(([id, bal]) => ({ id, bal }))
    .sort((a, b) => b.bal - a.bal);

  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.bal, creditor.bal);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      debts.push({
        from: users[debtor.id],
        to: users[creditor.id],
        amount: roundedAmount
      });
    }

    debtor.bal -= amount;
    creditor.bal -= amount;

    if (debtor.bal < 0.005) i++;
    if (creditor.bal < 0.005) j++;
  }

  return debts;
}
