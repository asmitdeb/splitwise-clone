'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMessage, getMessages } from "./actions"

type Message = {
  id: string
  content: string
  createdAt: string
  user: { id: string, name: string }
}

export function ExpenseChat({ expenseId, currentUserId, initialMessages }: { expenseId: string, currentUserId: string, initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const interval = setInterval(async () => {
      const lastMsg = messages[messages.length - 1];
      const newMessages = await getMessages(expenseId, lastMsg?.createdAt);
      if (newMessages.length > 0) {
        setMessages(prev => {
          const newIds = new Set(newMessages.map(m => m.id));
          return [...prev.filter(m => !newIds.has(m.id)), ...newMessages];
        });
      }
    }, 10000); // 10-second polling to reduce Next.js dev server overhead

    return () => clearInterval(interval);
  }, [expenseId, messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    const text = input;
    setInput("");
    
    const tempId = Math.random().toString();
    setMessages(prev => [...prev, {
      id: tempId,
      content: text,
      createdAt: new Date().toISOString(),
      user: { id: currentUserId, name: 'You' }
    }]);

    try {
      await sendMessage(expenseId, text);
    } catch (e) {
      console.error(e);
      setMessages(prev => prev.filter(m => m.id !== tempId)); // revert on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Expense Discussion</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isMe = msg.user.id === currentUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">{msg.user.name}</span>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] break-words ${isMe ? 'bg-green-600 text-white rounded-br-none shadow-sm' : 'bg-gray-100 text-gray-900 rounded-bl-none shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t bg-gray-50 flex items-center space-x-3">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Type a message..." 
          className="flex-1 bg-white border-gray-300 focus:ring-green-500"
        />
        <Button type="submit" disabled={!input.trim() || loading} className="bg-green-600 hover:bg-green-700 font-bold px-6">
          Send
        </Button>
      </form>
    </div>
  )
}
