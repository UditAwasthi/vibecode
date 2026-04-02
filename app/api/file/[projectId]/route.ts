import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const projectFiles = await db
    .select()
    .from(files)
    .where(eq(files.projectId, projectId));

  return Response.json(projectFiles);
}