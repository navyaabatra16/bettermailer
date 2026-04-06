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

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      return { ...prevState, error: "Email and password are required." };
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];

    if (!user) {
      return { ...prevState, error: "No account exists for that email." };
    }

    const storedPassword = user.password;
    const passwordMatches = storedPassword.startsWith("$2")
      ? await bcrypt.compare(password, storedPassword)
      : storedPassword === password;

    if (!passwordMatches) {
      return { ...prevState, error: "Invalid email or password." };
    }

    if (!storedPassword.startsWith("$2")) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));
    }

    await createSession(user.id);
  } catch (error) {
    console.error(error);
    return { ...prevState, error: "Unable to sign in right now." };
  }

  redirect(DEFAULT_AUTHENTICATED_ROUTE);
}
