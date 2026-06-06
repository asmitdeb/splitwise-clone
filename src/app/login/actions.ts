'use server'

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(prevState: { error: string } | undefined, formData: FormData) {
  try {
    await signIn("credentials", Object.fromEntries(formData));
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
