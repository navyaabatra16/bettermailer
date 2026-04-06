import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { getDb } from "@/app/src/db";
import { users } from "@/app/src/db/schema";
import {
  getAllowedEmailDomainMessage,
  isAllowedEmailDomain,
} from "@/lib/email-domain";

export type AuthResult = {
  error: string | null;
  success: string | null;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeName(value: string) {
  return value.trim();
}

export async function createUserAccount(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResult> {
  const name = normalizeName(input.name);
  const email = normalizeEmail(input.email);
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (!name || !email || !password || !confirmPassword) {
    return { error: "Missing required fields.", success: null };
  }

  if (!email.includes("@")) {
    return { error: "Enter a valid email address.", success: null };
  }

  if (!isAllowedEmailDomain(email)) {
    return { error: getAllowedEmailDomainMessage(), success: null };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", success: null };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match.", success: null };
  }

  const db = getDb();
  const existingUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUsers[0]) {
    return { error: "An account with this email already exists.", success: null };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: passwordHash,
  });

  return { error: null, success: "Account created successfully." };
}

export async function verifyUserAccount(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || !password) {
    return { error: "Missing credentials.", success: null };
  }

  if (!isAllowedEmailDomain(email)) {
    return { error: getAllowedEmailDomainMessage(), success: null };
  }

  const db = getDb();
  const matchingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = matchingUsers[0];

  if (!user) {
    return { error: "No account found for this email.", success: null };
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return { error: "Incorrect password.", success: null };
  }

  return { error: null, success: "Login successful." };
}
