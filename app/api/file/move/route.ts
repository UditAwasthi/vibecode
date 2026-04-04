import { auth } from "@/lib/auth";
import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fileId, newPath, newName } = body;

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }

  try {
    const updateData: any = {};
    if (newPath !== undefined) updateData.path = newPath;
    if (newName !== undefined) updateData.name = newName;

    const [updatedFile] = await db
      .update(files)
      .set(updateData)
      .where(eq(files.id, fileId))
      .returning();

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Error moving/renaming file:", error);
    return NextResponse.json({ error: "Failed to move/rename file" }, { status: 500 });
  }
}