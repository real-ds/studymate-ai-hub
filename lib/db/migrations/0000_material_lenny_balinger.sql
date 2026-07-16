CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"provider" text NOT NULL,
	"encryptedKey" text NOT NULL,
	"label" text,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_records" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"originalName" text NOT NULL,
	"fileUrl" text NOT NULL,
	"fileType" text NOT NULL,
	"fileSize" integer,
	"feature" text NOT NULL,
	"status" text DEFAULT 'pending',
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_storage" (
	"id" text PRIMARY KEY NOT NULL,
	"data" text NOT NULL,
	"mime_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "sessions_output" (
	"id" text PRIMARY KEY NOT NULL,
	"fileRecordId" uuid,
	"userId" uuid NOT NULL,
	"feature" text NOT NULL,
	"outputJson" jsonb,
	"outputText" text,
	"pdfUrl" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"passwordHash" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_records" ADD CONSTRAINT "file_records_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions_output" ADD CONSTRAINT "sessions_output_fileRecordId_file_records_id_fk" FOREIGN KEY ("fileRecordId") REFERENCES "public"."file_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions_output" ADD CONSTRAINT "sessions_output_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_index" ON "accounts" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE INDEX "idx_api_keys_user_id" ON "api_keys" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_file_records_user_id" ON "file_records" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_file_records_feature" ON "file_records" USING btree ("feature");--> statement-breakpoint
CREATE INDEX "idx_sessions_output_user_id" ON "sessions_output" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_sessions_output_file_record_id" ON "sessions_output" USING btree ("fileRecordId");