"use server";

import { verifyUserAccount } from "@/lib/user-auth";

export type SigninState = {
  error: string | null;
  success: string | null;
};

export async function signinAction(
  prevState: SigninState,
  formData: FormData
): Promise<SigninState> {
  try {
    return await verifyUserAccount({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
  } catch (err) {
    console.error(err);
    return { ...prevState, error: "Unable to sign in right now.", success: null };
  }
}
