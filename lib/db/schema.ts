import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    providerAccountIdUnique: uniqueIndex()
      .on(account.provider, account.providerAccountId),
  })
);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("session_token").unique().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    identifierTokenPk: primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  })
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    encryptedKey: text("encrypted_key").notNull(),
    label: text("label"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_api_keys_user_id").on(table.userId),
  })
);

export const fileRecords = pgTable(
  "file_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    originalName: text("original_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size"),
    feature: text("feature").notNull(),
    status: text("status").default("pending"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_file_records_user_id").on(table.userId),
    featureIdx: index("idx_file_records_feature").on(table.feature),
  })
);

export const sessionsOutput = pgTable(
  "sessions_output",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fileRecordId: uuid("file_record_id").references(() => fileRecords.id, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    feature: text("feature").notNull(),
    outputJson: jsonb("output_json"),
    outputText: text("output_text"),
    pdfUrl: text("pdf_url"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_sessions_output_user_id").on(table.userId),
    fileRecordIdIdx: index("idx_sessions_output_file_record_id").on(
      table.fileRecordId
    ),
  })
);

export const schema = {
  users,
  accounts,
  sessions,
  verificationTokens,
  apiKeys,
  fileRecords,
  sessionsOutput,
};
