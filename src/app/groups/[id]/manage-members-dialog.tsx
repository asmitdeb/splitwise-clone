'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"
import { addMemberToGroup, removeMemberFromGroup } from "./member-actions"

type User = { id: string, name: string, email: string }

export function ManageMembersDialog({ 
  groupId, 
  currentMembers, 
  allUsers 
}: { 
  groupId: string, 
  currentMembers: User[], 
  allUsers: User[] 
}) {
  const [open, setOpen] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentMemberIds = new Set(currentMembers.map(m => m.id))
  const nonMembers = allUsers.filter(u => !currentMemberIds.has(u.id))

  async function handleAdd(userId: string) {
    setLoadingId(userId)
    setError(null)
    try {
      await addMemberToGroup(groupId, userId)
    } catch (e: any) {
      setError(e.message || "Failed to add member")
    } finally {
      setLoadingId(null)
    }
  }

  async function handleRemove(userId: string) {
    setLoadingId(userId)
    setError(null)
    try {
      await removeMemberFromGroup(groupId, userId)
    } catch (e: any) {
      setError(e.message || "Failed to remove member")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); setError(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-semibold text-gray-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Manage Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Group Members</DialogTitle>
          <DialogDescription>Add new friends or remove members who haven't participated.</DialogDescription>
        </DialogHeader>

        {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md font-medium">{error}</div>}

        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">Current Members ({currentMembers.length})</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {currentMembers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                    onClick={() => handleRemove(user.id)}
                    disabled={loadingId === user.id}
                    title="Remove user"
                  >
                    {loadingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Add New Members</h4>
            {nonMembers.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Everyone is already in the group!</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {nonMembers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleAdd(user.id)}
                      disabled={loadingId === user.id}
                      className="font-medium h-8"
                    >
                      {loadingId === user.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <UserPlus className="w-3 h-3 mr-1" />}
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
