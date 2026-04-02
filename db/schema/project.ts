import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: text("title").notNull(),
  template: text("template").notNull(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
});