import { prisma } from "@/lib/prisma"
import { loginUser } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="flex h-full w-full items-center justify-center flex-1 py-12">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-500">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Splitwise MVP</CardTitle>
          <CardDescription className="text-lg">Select a mock user to log in</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => {
            'use server'
            const userId = formData.get('userId') as string;
            if (userId) {
              await loginUser(userId);
            }
          }} className="flex flex-col space-y-6">
            <div className="relative">
              <select 
                name="userId" 
                required 
                className="w-full p-4 border rounded-xl bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none outline-none transition-all"
                defaultValue=""
              >
                <option value="" disabled>Select an account...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 transition-colors">
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
