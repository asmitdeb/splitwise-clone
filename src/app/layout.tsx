import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logoutUser } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Splitwise Clone MVP",
  description: "A simple bill-splitting MVP",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  let user = null;
  
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } });
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {user && (
          <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="font-bold text-xl text-green-600 tracking-tight">Splitwise MVP</div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">
                  Logged in as <span className="font-bold text-gray-900">{user.name}</span>
                </span>
                <form action={logoutUser}>
                  <Button variant="outline" size="sm" type="submit" className="font-semibold">Log Out</Button>
                </form>
              </div>
            </div>
          </header>
        )}
        <main className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
