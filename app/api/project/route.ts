import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { NextResponse } from "next/server";
import { files } from "@/db/schema";
import { reactTemplate } from "@/lib/templates/react";
export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, template } = body;

    if (!title || !template) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }


    const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, session.user.email),
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // create project
    const [project] = await db
        .insert(projects)
        .values({
            title,
            template,
            userId: user.id,
        })
        .returning();
    await db.insert(files).values(
        reactTemplate.map((file) => ({
            projectId: project.id,
            name: file.name,
            path: file.path,
            content: file.content,
            isFolder: false,
        }))
    );
    return NextResponse.json(project);
}