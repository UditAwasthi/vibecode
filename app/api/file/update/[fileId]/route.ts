import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const { content } = await req.json();

  await db
    .update(files)
    .set({ content })
    .where(eq(files.id, fileId));

  return Response.json({ success: true });
}