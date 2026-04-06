"use server";

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/app/src/db";
import { users } from "@/app/src/db/schema";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  createSession,
} from "@/lib/auth";

export type SignupState = {
  error: string | null;
};

export async function signupAction(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!name || !email || !password || !confirmPassword) {
      return { ...prevState, error: "All fields are required." };
    }

    if (password.length < 8) {
      return {
        ...prevState,
        error: "Password must be at least 8 characters long.",
      };
    }

    if (password !== confirmPassword) {
      return { ...prevState, error: "Passwords do not match." };
    }

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser[0]) {
      return { ...prevState, error: "An account with that email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertedUsers = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id });

    const user = insertedUsers[0];

    if (!user) {
      return { ...prevState, error: "Unable to create account right now." };
    }

    await createSession(user.id);
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      error: "Unable to create account right now.",
    };
  }

  redirect(DEFAULT_AUTHENTICATED_ROUTE);
}
