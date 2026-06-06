'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createGroup(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const participantIds = formData.getAll('participantIds') as string[];

  // Ensure current user is in the group
  const members = new Set([userId, ...participantIds]);

  const group = await prisma.group.create({
    data: {
      name,
      members: {
        create: Array.from(members).map(id => ({ userId: id }))
      }
    }
  });

  revalidatePath('/');
  redirect(`/groups/${group.id}`);
}
