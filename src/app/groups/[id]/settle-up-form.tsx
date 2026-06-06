'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSettlement } from "./actions"
import type { Debt } from "./balances"

export function SettleUpForm({ groupId, debts, currentUserId }: { groupId: string, debts: Debt[], currentUserId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const defaultDebt = debts.find(d => d.from.id === currentUserId) || debts[0];
  
  const [selectedDebtIdx, setSelectedDebtIdx] = useState<number>(debts.findIndex(d => d === defaultDebt) !== -1 ? debts.findIndex(d => d === defaultDebt) : 0)
  const [amount, setAmount] = useState<number | "">(defaultDebt?.amount || "")

  if (debts.length === 0) {
    return <Button disabled className="bg-gray-300">Settle Up</Button>
  }

  const selectedDebt = debts[selectedDebtIdx]

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0 || loading || !selectedDebt) return
    setLoading(true)

    try {
      await createSettlement(groupId, {
        payerId: selectedDebt.from.id,
        payeeId: selectedDebt.to.id,
        amount: Number(amount)
      })
      setOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">Settle Up</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Record a payment</DialogTitle>
            <DialogDescription>
              Record cash, Venmo, or other out-of-band payments to settle debts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Who is paying whom?</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedDebtIdx}
                onChange={e => {
                  const idx = Number(e.target.value)
                  setSelectedDebtIdx(idx)
                  setAmount(debts[idx].amount)
                }}
              >
                {debts.map((d, i) => (
                  <option key={i} value={i}>
                    {d.from.name} pays {d.to.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input 
                type="number" 
                step="0.01" 
                min="0.01" 
                max={selectedDebt?.amount} 
                value={amount} 
                onChange={e => setAmount(parseFloat(e.target.value) || "")} 
                required 
              />
              <p className="text-xs text-gray-500">Max to settle this debt: ${selectedDebt?.amount.toFixed(2)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              {loading ? "Recording..." : "Save Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
