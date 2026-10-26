import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  content: text("content").notNull(),
  updatedAt: text("updated_at").notNull(),
});
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  payload: text("payload").notNull(),
  crmStatus: text("crm_status").notNull().default("pending"),
  crmError: text("crm_error"),
  status: text("status").notNull().default("novo"),
});
export const limits = sqliteTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    expires: integer("expires").notNull(),
  },
  (t) => [index("idx_rate_limits_expires").on(t.expires)],
);
export const events = sqliteTable("events", {
  key: text("key").primaryKey(),
  day: text("day").notNull(),
  name: text("name").notNull(),
  count: integer("count").notNull(),
});
