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
  id: text("id").$defaultFn(() => crypto.randomUUID()).primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("passwordHash"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").$defaultFn(() => crypto.randomUUID()).primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
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
  id: text("id").$defaultFn(() => crypto.randomUUID()).primaryKey(),
  sessionToken: text("sessionToken").unique().notNull(),
  userId: text("userId")
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
    id: text("id").$defaultFn(() => crypto.randomUUID()).primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    encryptedKey: text("encryptedKey").notNull(),
    label: text("label"),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_api_keys_user_id").on(table.userId),
  })
);

export const fileRecords = pgTable(
  "file_records",
  {
    id: text("id").$defaultFn(() => crypto.randomUUID()).primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    originalName: text("originalName").notNull(),
    fileUrl: text("fileUrl").notNull(),
    fileType: text("fileType").notNull(),
    fileSize: integer("fileSize"),
    feature: text("feature").notNull(),
    status: text("status").default("pending"),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_file_records_user_id").on(table.userId),
    featureIdx: index("idx_file_records_feature").on(table.feature),
  })
);

export const sessionsOutput = pgTable(
  "sessions_output",
  {
    id: text("id").$defaultFn(() => crypto.randomUUID()).primaryKey(),
    fileRecordId: text("fileRecordId").references(() => fileRecords.id, {
      onDelete: "cascade",
    }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    feature: text("feature").notNull(),
    outputJson: jsonb("outputJson"),
    outputText: text("outputText"),
    pdfUrl: text("pdfUrl"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_sessions_output_user_id").on(table.userId),
    fileRecordIdIdx: index("idx_sessions_output_file_record_id").on(
      table.fileRecordId
    ),
  })
);

export const fileStorage = pgTable(
  "file_storage",
  {
    id: text("id").$defaultFn(() => crypto.randomUUID()).primaryKey(),
    data: text("data").notNull(),
    mimeType: text("mime_type").notNull(),
  }
);

export const schema = {
  users,
  accounts,
  sessions,
  verificationTokens,
  apiKeys,
  fileRecords,
  sessionsOutput,
  fileStorage,
};
