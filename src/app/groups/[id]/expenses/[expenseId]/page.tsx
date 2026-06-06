import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ExpenseChat } from "./chat"

export default async function ExpensePage({ params }: { params: Promise<{ id: string, expenseId: string }> }) {
  const { id, expenseId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      payer: true,
      participants: { include: { user: true } },
      messages: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!expense || expense.groupId !== id) {
    return <div className="text-center py-12">Expense not found</div>;
  }

  const serializedMessages = expense.messages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/groups/${id}`} className="text-gray-500 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-md text-sm transition-colors font-medium">&larr; Back to Group</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-gray-900">{expense.description}</h1>
          <div className="text-3xl font-extrabold text-green-600 mb-8">${expense.totalAmount.toFixed(2)}</div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold border-b pb-3 mb-4 text-gray-800">Paid by {expense.payer.name}</h2>
            <ul className="space-y-4">
              {expense.participants.map(p => (
                <li key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-800">{p.user.name}</span>
                  <span className="font-bold text-lg">${p.amountOwed.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <ExpenseChat expenseId={expense.id} currentUserId={userId} initialMessages={serializedMessages} />
        </div>
      </div>
    </div>
  )
}
