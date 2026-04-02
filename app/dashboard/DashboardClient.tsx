"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/project.store";

export default function DashboardClient({ projects }: { projects: any[] }) {
  const router = useRouter();
  const { projects: storeProjects, setProjects, addProject } = useProjectStore();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProjects(projects);
  }, [projects, setProjects]);

  const createProject = async () => {
    setLoading(true);

    const res = await fetch("/api/project", {
      method: "POST",
      body: JSON.stringify({
        title: "New Project",
        template: "react",
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (data?.id) {
      addProject(data); 
      router.push(`/playground/${data.id}`);
    }
  };

  return (
    <div className="p-6 text-white">
      
      {/*  Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>

        <button
          onClick={createProject}
          className="px-4 py-2 bg-white text-black rounded-lg hover:opacity-90 transition"
        >
          {loading ? "Creating..." : "+ New Project"}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {storeProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push(`/playground/${project.id}`)}
            className="cursor-pointer rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition"
          >
            <h2 className="text-lg font-semibold">{project.title}</h2>

            <p className="text-sm text-muted-foreground mt-2">
              {project.template}
            </p>

            <p className="text-xs text-muted-foreground mt-4">
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/*  Empty State */}
      {storeProjects.length === 0 && (
        <div className="mt-20 text-center text-muted-foreground">
          <p>No projects yet</p>
          <p className="text-sm mt-2">Create your first project 🚀</p>
        </div>
      )}
    </div>
  );
}