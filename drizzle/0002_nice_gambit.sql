CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_email" varchar(255) NOT NULL,
	"mailbox" varchar(32) NOT NULL,
	"direction" varchar(16) NOT NULL,
	"sender_name" varchar(255) NOT NULL,
	"sender_email" varchar(255) NOT NULL,
	"recipient_email" varchar(255),
	"subject" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"snippet" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
