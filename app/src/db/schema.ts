import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  password: text("password").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emails = pgTable("emails", {
  id: uuid("id").defaultRandom().primaryKey(),

  ownerEmail: varchar("owner_email", { length: 255 }).notNull(),

  mailbox: varchar("mailbox", { length: 32 }).notNull(),

  direction: varchar("direction", { length: 16 }).notNull(),

  senderName: varchar("sender_name", { length: 255 }).notNull(),

  senderEmail: varchar("sender_email", { length: 255 }).notNull(),

  recipientEmail: varchar("recipient_email", { length: 255 }),

  subject: varchar("subject", { length: 255 }).notNull(),

  body: text("body").notNull(),

  snippet: text("snippet").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
