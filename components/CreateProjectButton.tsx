"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProjectStore } from "@/store/project.store";

const { addProject } = useProjectStore();
export default function CreateProjectButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { addProject } = useProjectStore();
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
        addProject(data);

        setLoading(false);

        if (data?.id) {
            router.push(`/playground/${data.id}`);
        }
    };

    return (
        <button
            onClick={createProject}
            className="px-4 py-2 bg-white text-black rounded"
        >
            {loading ? "Creating..." : "New Project"}
        </button>
    );
}