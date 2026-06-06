import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddExpenseForm } from "./add-expense-form"
import { calculateBalances } from "./balances"
import { SettleUpForm } from "./settle-up-form"
import { ManageMembersDialog } from "./manage-members-dialog"
import Link from "next/link"

// Prevent Next.js from trying to statically generate this dynamic route which uses cookies()
export const dynamic = 'force-dynamic'

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: true }
      },
      expenses: {
        include: { payer: true, participants: true },
        orderBy: { createdAt: 'desc' }
      },
      settlements: {
        include: { payer: true, payee: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!group) return <div className="text-center py-12 text-gray-500">Group not found</div>;

  const members = group.members.map(m => m.user);
  const debts = await calculateBalances(group.id);
  const allUsers = await prisma.user.findMany({ select: { id: true, name: true, email: true } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-500 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-md text-sm transition-colors">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-extrabold tracking-tight">{group.name}</h1>
        </div>
        <ManageMembersDialog groupId={group.id} currentMembers={members} allUsers={allUsers} />
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-1/2 bg-gray-100">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="balances">Balances & Settle</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-8 mt-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Add a new expense</h2>
            <AddExpenseForm groupId={group.id} members={members} currentUserId={userId} />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Expenses</h2>
            <div className="space-y-4">
              {group.expenses.length === 0 ? (
                <div className="p-12 text-center text-gray-500 border border-dashed rounded-xl bg-gray-50">
                  No expenses yet. Add one above to get started!
                </div>
              ) : (
                group.expenses.map(expense => (
                  <Link href={`/groups/${group.id}/expenses/${expense.id}`} key={expense.id} className="block">
                    <div className="flex items-center justify-between p-5 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
                      <div>
                        <h3 className="font-bold text-lg">{expense.description}</h3>
                        <p className="text-sm text-gray-500">Paid by <span className="font-semibold text-gray-700">{expense.payer.name}</span></p>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl">${expense.totalAmount.toFixed(2)}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(expense.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="balances" className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Group Balances</h2>
            <SettleUpForm groupId={group.id} debts={debts} currentUserId={userId} />
          </div>

          {debts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border border-dashed rounded-xl bg-gray-50">
              All debts are settled!
            </div>
          ) : (
            <div className="grid gap-4">
              {debts.map((debt, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white rounded-xl border shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xl">
                      {debt.from.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-lg">{debt.from.name}</span>
                      <span className="text-sm text-gray-500">owes <span className="font-medium text-gray-700">{debt.to.name}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-2xl text-red-600">${debt.amount.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <section className="pt-8 mt-8 border-t">
            <h2 className="text-2xl font-bold mb-4">Recent Payments</h2>
            <div className="space-y-4">
              {group.settlements.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border border-dashed rounded-xl bg-gray-50">
                  No payments have been made yet.
                </div>
              ) : (
                group.settlements.map(settlement => (
                  <div key={settlement.id} className="flex items-center justify-between p-5 bg-white rounded-xl border shadow-sm border-l-4 border-l-blue-500">
                    <div>
                      <p className="text-lg text-gray-700">
                        <span className="font-bold text-gray-900">{settlement.payer.name}</span> paid <span className="font-bold text-gray-900">{settlement.payee.name}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xl text-blue-600">${settlement.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(settlement.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
