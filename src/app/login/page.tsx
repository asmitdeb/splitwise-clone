"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { authenticate } from "./actions"
import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit" className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 transition-colors">
      {pending ? "Logging in..." : "Log In"}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="flex h-full w-full items-center justify-center flex-1 py-12">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-500">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Spreetail</CardTitle>
          <CardDescription className="text-lg">Log in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="flex flex-col space-y-6">
            <div className="space-y-4">
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                className="w-full p-4 border rounded-xl bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                className="w-full p-4 border rounded-xl bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>
            {errorMessage?.error && (
              <p className="text-sm text-red-500 font-medium text-center">{errorMessage.error}</p>
            )}
            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4 border-t">
          <p className="text-sm text-gray-600 w-full text-center">
            Don't have an account?{' '}
            <Link href="/register" className="text-green-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
          <div className="w-full pt-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 text-center">1-Click Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Alice", email: "alice@example.com" },
                { name: "Bob", email: "bob@example.com" },
                { name: "Charlie", email: "charlie@example.com" },
                { name: "David", email: "david@example.com" }
              ].map((demoUser) => (
                <form action={dispatch} key={demoUser.email}>
                  <input type="hidden" name="email" value={demoUser.email} />
                  <input type="hidden" name="password" value="password123" />
                  <Button variant="outline" size="sm" type="submit" className="w-full text-xs font-medium">
                    Log in as {demoUser.name}
                  </Button>
                </form>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
