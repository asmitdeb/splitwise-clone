import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { registerUser } from "./actions"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex h-full w-full items-center justify-center flex-1 py-12">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-500">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Spreetail</CardTitle>
          <CardDescription className="text-lg">Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={registerUser} className="flex flex-col space-y-6">
            <div className="space-y-4">
              <input
                name="name"
                type="text"
                required
                placeholder="Full Name"
                className="w-full p-4 border rounded-xl bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
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
            <Button type="submit" className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 transition-colors">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
