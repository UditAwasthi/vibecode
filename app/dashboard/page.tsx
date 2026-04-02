import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { eq } from "drizzle-orm";

import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.email) return null;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  const userId = user[0].id;

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId));

  return <DashboardClient projects={userProjects} />;
}