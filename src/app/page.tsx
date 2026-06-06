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
          group: true
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Groups</h1>
        <CreateGroupDialog users={allUsers} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {user.groupMembers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
            You don't have any groups yet.
          </div>
        ) : (
          user.groupMembers.map(({ group }) => (
            <Link key={group.id} href={`/groups/${group.id}`} className="h-full block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-t-4 border-t-blue-500">
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>Created {new Date(group.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
