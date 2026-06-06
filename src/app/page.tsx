import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { CreateGroupDialog } from "./create-group-dialog";

export default async function Dashboard() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      groupMembers: {
        include: {
          group: {
            include: {
              expenses: { include: { participants: true } },
              settlements: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  const allUsers = await prisma.user.findMany({
    where: { id: { not: userId } },
    orderBy: { name: 'asc' }
  });

  let totalBalance = 0;
  
  const groupsWithBalances = user.groupMembers.map(({ group }) => {
    let groupBalance = 0;
    
    group.expenses.forEach(exp => {
      if (exp.payerId === userId) groupBalance += exp.totalAmount;
      exp.participants.forEach(p => {
        if (p.userId === userId) groupBalance -= p.amountOwed;
      });
    });

    group.settlements.forEach(settle => {
      if (settle.payerId === userId) groupBalance += settle.amount;
      if (settle.payeeId === userId) groupBalance -= settle.amount;
    });

    totalBalance += groupBalance;

    return {
      ...group,
      balance: groupBalance
    };
  });

  return (
    <div className="space-y-8">
      {/* Individual Balance Summary Widget */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center space-y-2">
        <h2 className="text-gray-500 font-bold uppercase tracking-widest text-xs">Total Balance</h2>
        {Math.abs(totalBalance) < 0.005 ? (
          <div className="text-4xl font-black text-gray-800 tracking-tight">Settled Up</div>
        ) : totalBalance > 0 ? (
          <div className="text-4xl font-black text-green-600 tracking-tight">you are owed ${totalBalance.toFixed(2)}</div>
        ) : (
          <div className="text-4xl font-black text-red-600 tracking-tight">you owe ${Math.abs(totalBalance).toFixed(2)}</div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Your Groups</h1>
          <CreateGroupDialog users={allUsers} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupsWithBalances.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
              You don't have any groups yet.
            </div>
          ) : (
            groupsWithBalances.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`} className="h-full block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-t-4 border-t-blue-500 flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>Created {new Date(group.createdAt).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Math.abs(group.balance) < 0.005 ? (
                      <span className="text-sm font-semibold text-gray-500">Settled</span>
                    ) : group.balance > 0 ? (
                      <span className="text-sm font-bold text-green-600">You are owed ${(group.balance).toFixed(2)}</span>
                    ) : (
                      <span className="text-sm font-bold text-red-600">You owe ${Math.abs(group.balance).toFixed(2)}</span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
