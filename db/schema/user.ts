import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name"),
  email: text("email").unique().notNull(),
  image: text("image"),

  role: text("role").default("USER"), 
  createdAt: timestamp("created_at").defaultNow(),
});