"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProjectStore } from "@/store/project.store";

export default function CreateProjectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { addProject } = useProjectStore();

  const createProject = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Project", template: "react" }),
      });
      const data = await res.json();
      addProject(data);
      if (data?.id) router.push(`/playground/${data.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .create-btn:hover:not(:disabled) {
          background: #1c2128 !important;
          border-color: #58a6ff !important;
          color: #e6edf3 !important;
          box-shadow: 0 0 0 3px rgba(88,166,255,0.1) !important;
        }
        .create-btn:active:not(:disabled) { transform: scale(0.97); }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <button
        className="create-btn"
        onClick={createProject}
        disabled={loading}
        style={{
          background: "#161b22",
          color: "#e6edf3",
          border: "1px solid #30363d",
          padding: "8px 16px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          transition: "all 0.15s ease",
          fontFamily: '"Inter", system-ui, sans-serif',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
              <circle cx="7" cy="7" r="5.5" stroke="#8b949e" strokeWidth="1.5" strokeDasharray="14 14" strokeLinecap="round"/>
            </svg>
            Creating…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="#58a6ff" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            New Project
          </>
        )}
      </button>
    </>
  );
}