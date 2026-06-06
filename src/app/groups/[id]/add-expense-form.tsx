'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createExpense } from "./actions"

type User = { id: string, name: string }

export function AddExpenseForm({ groupId, members, currentUserId }: { groupId: string, members: User[], currentUserId: string }) {
  const [description, setDescription] = useState("")
  const [totalAmount, setTotalAmount] = useState<number | "">("")
  const [payerId, setPayerId] = useState(currentUserId)
  const [splitType, setSplitType] = useState<"EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARE">("EQUAL")
  
  const [equalSplits, setEqualSplits] = useState<Record<string, boolean>>(
    Object.fromEntries(members.map(m => [m.id, true]))
  )
  const [unequalSplits, setUnequalSplits] = useState<Record<string, number | "">>(
    Object.fromEntries(members.map(m => [m.id, ""]))
  )
  const [percentageSplits, setPercentageSplits] = useState<Record<string, number | "">>(
    Object.fromEntries(members.map(m => [m.id, ""]))
  )
  const [shareSplits, setShareSplits] = useState<Record<string, number | "">>(
    Object.fromEntries(members.map(m => [m.id, 1]))
  )

  const [loading, setLoading] = useState(false)

  const amount = typeof totalAmount === "number" ? totalAmount : 0;

  // Validation
  let isValid = false;
  if (description && amount > 0) {
    if (splitType === "EQUAL") {
      isValid = Object.values(equalSplits).some(v => v === true);
    } else if (splitType === "UNEQUAL") {
      const sum = Object.values(unequalSplits).reduce((a: number, b) => a + Number(b || 0), 0);
      isValid = Math.abs(sum - amount) < 0.01;
    } else if (splitType === "PERCENTAGE") {
      const sum = Object.values(percentageSplits).reduce((a: number, b) => a + Number(b || 0), 0);
      isValid = Math.abs(sum - 100) < 0.01;
    } else if (splitType === "SHARE") {
      const sum = Object.values(shareSplits).reduce((a: number, b) => a + Number(b || 0), 0);
      isValid = sum > 0;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || loading) return;
    setLoading(true);

    let finalSplits: Record<string, number> = {};
    if (splitType === "EQUAL") {
      Object.entries(equalSplits).forEach(([id, checked]) => {
        if (checked) finalSplits[id] = 1;
      });
    } else if (splitType === "UNEQUAL") {
      Object.entries(unequalSplits).forEach(([id, val]) => {
        if (Number(val) > 0) finalSplits[id] = Number(val);
      });
    } else if (splitType === "PERCENTAGE") {
      Object.entries(percentageSplits).forEach(([id, val]) => {
        if (Number(val) > 0) finalSplits[id] = Number(val);
      });
    } else if (splitType === "SHARE") {
      Object.entries(shareSplits).forEach(([id, val]) => {
        if (Number(val) > 0) finalSplits[id] = Number(val);
      });
    }

    try {
      await createExpense(groupId, {
        description,
        totalAmount: amount,
        payerId,
        splitType,
        splits: finalSplits
      });
      setDescription("");
      setTotalAmount("");
      // Reset splits to default states
      setUnequalSplits(Object.fromEntries(members.map(m => [m.id, ""])));
      setPercentageSplits(Object.fromEntries(members.map(m => [m.id, ""])));
      setEqualSplits(Object.fromEntries(members.map(m => [m.id, true])));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Description</Label>
          <Input placeholder="Dinner, Groceries..." value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Total Amount ($)</Label>
          <Input type="number" step="0.01" min="0.01" value={totalAmount} onChange={e => setTotalAmount(parseFloat(e.target.value) || "")} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Who paid?</Label>
        <select 
          className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-green-500 outline-none"
          value={payerId}
          onChange={e => setPayerId(e.target.value)}
        >
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.id === currentUserId ? 'You' : m.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <Label className="text-base font-semibold">Split Options</Label>
        <Tabs defaultValue="EQUAL" onValueChange={(v) => setSplitType(v as any)}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="EQUAL">Equal</TabsTrigger>
            <TabsTrigger value="UNEQUAL">Unequal</TabsTrigger>
            <TabsTrigger value="PERCENTAGE">Percentage</TabsTrigger>
            <TabsTrigger value="SHARE">Shares</TabsTrigger>
          </TabsList>

          <TabsContent value="EQUAL" className="space-y-3 mt-6">
            {members.map(m => (
              <label key={m.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={equalSplits[m.id]} 
                  onChange={e => setEqualSplits(s => ({...s, [m.id]: e.target.checked}))} 
                  className="rounded border-gray-300 w-5 h-5 text-green-600 focus:ring-green-600"
                />
                <span className="font-medium">{m.name}</span>
              </label>
            ))}
          </TabsContent>

          <TabsContent value="UNEQUAL" className="space-y-3 mt-6">
            {members.map(m => (
              <div key={m.id} className="flex items-center space-x-4">
                <span className="w-1/3 truncate font-medium">{m.name}</span>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder="0.00"
                  value={unequalSplits[m.id]} 
                  onChange={e => setUnequalSplits(s => ({...s, [m.id]: parseFloat(e.target.value) || ""}))}
                />
              </div>
            ))}
            <div className={`text-sm text-right font-medium ${isValid ? 'text-green-600' : 'text-red-500'}`}>
              Sum: ${Object.values(unequalSplits).reduce((a: number, b) => a + Number(b || 0), 0).toFixed(2)} / ${amount.toFixed(2)}
            </div>
          </TabsContent>

          <TabsContent value="PERCENTAGE" className="space-y-3 mt-6">
            {members.map(m => (
              <div key={m.id} className="flex items-center space-x-4">
                <span className="w-1/3 truncate font-medium">{m.name}</span>
                <div className="relative flex-1">
                  <Input 
                    type="number" 
                    step="1" 
                    min="0"
                    max="100"
                    placeholder="0"
                    value={percentageSplits[m.id]} 
                    onChange={e => setPercentageSplits(s => ({...s, [m.id]: parseFloat(e.target.value) || ""}))}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
              </div>
            ))}
            <div className={`text-sm text-right font-medium ${isValid ? 'text-green-600' : 'text-red-500'}`}>
              Total: {Object.values(percentageSplits).reduce((a: number, b) => a + Number(b || 0), 0)}% / 100%
            </div>
          </TabsContent>

          <TabsContent value="SHARE" className="space-y-3 mt-6">
            {members.map(m => (
              <div key={m.id} className="flex items-center space-x-4">
                <span className="w-1/3 truncate font-medium">{m.name}</span>
                <div className="relative flex-1">
                  <Input 
                    type="number" 
                    step="1" 
                    min="0"
                    placeholder="1"
                    value={shareSplits[m.id]} 
                    onChange={e => setShareSplits(s => ({...s, [m.id]: parseFloat(e.target.value) || ""}))}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500 text-sm">shares</span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <Button type="submit" disabled={!isValid || loading} className={`w-full h-12 text-lg ${isValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'}`}>
        {loading ? "Adding Expense..." : "Add Expense"}
      </Button>
    </form>
  )
}
