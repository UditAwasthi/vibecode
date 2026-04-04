import { auth } from "@/lib/auth";
import { db } from "@/db";
import { files } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, name, path, isFolder } = body;

  if (!projectId || !name || !path) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const [newFile] = await db
      .insert(files)
      .values({
        projectId,
        name,
        path,
        content: isFolder ? null : "",
        isFolder: isFolder || false,
      })
      .returning();

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json({ error: "Failed to create file" }, { status: 500 });
  }
}