import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { projects } from "./project";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  name: text("name").notNull(),        // App.tsx
  path: text("path").notNull(),        // /src/App.tsx

  content: text("content"),            // null for folders
  isFolder: boolean("is_folder").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});