"use server";

import { db } from "@/app/src/db";
import { users } from "@/app/src/db/schema";
import { eq } from "drizzle-orm";

export type SigninState = {
  error: string | null;
  success: string | null;
};

export async function signinAction(
  prevState: SigninState,
  formData: FormData
): Promise<SigninState> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { ...prevState, error: "Missing credentials", success: null };
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    const user = result[0];

    if (!user) {
      return { ...prevState, error: "User not found", success: null };
    }

    if (user.password !== password) {
      return { ...prevState, error: "Invalid password", success: null };
    }

    return { error: null, success: "Login successful" };
  } catch (err) {
    console.log(err);
    return { ...prevState, error: "Server error", success: null };
  }
}
