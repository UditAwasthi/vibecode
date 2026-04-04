"use client";

import { useRef, useState } from "react";
import { useFileStore } from "@/store/file.store";

export default function TopBar() {
  const { projectName, setProjectName, unsavedIds, openTabs } = useFileStore();
  const [editingName, setEditingName] = useState(false);
  const [draft, setDraft] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  const unsavedCount = openTabs.filter((f) => unsavedIds.has(f.id)).length;

  const commitName = () => {
    const val = draft.trim();
    if (val) setProjectName(val);
    else setDraft(projectName);
    setEditingName(false);
  };

  return (
    <div
      style={{
        height: 44, // Slightly taller for a premium feel
        background: "#0f0f0f",
        borderBottom: "1px solid #222",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        flexShrink: 0,
        zIndex: 100,
        gap: 16,
        fontFamily: '"Inter", system-ui, sans-serif'
      }}
    >
      {/* LEFT — Logo + Project Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 24, height: 24, background: "#fff", borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 15px rgba(255,255,255,0.1)"
        }}>
          <span style={{ color: "#000", fontWeight: 900, fontSize: 14 }}>G</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {editingName ? (
            <input
              ref={inputRef}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => e.key === "Enter" && commitName()}
              style={{
                background: "#1a1a1a", border: "1px solid #444", color: "#eee",
                fontSize: 13, padding: "2px 8px", borderRadius: 4, outline: "none"
              }}
            />
          ) : (
            <div 
              onClick={() => { setEditingName(true); setDraft(projectName); }}
              style={{ 
                fontSize: 13, fontWeight: 500, color: "#eee", cursor: "pointer",
                padding: "4px 8px", borderRadius: 6, transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#1a1a1a"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {projectName}
            </div>
          )}
          {unsavedCount > 0 && (
            <span style={{ 
              background: "#d7ba7d33", color: "#d7ba7d", fontSize: 10, 
              padding: "1px 6px", borderRadius: 10, fontWeight: 600 
            }}>
              {unsavedCount} MODIFIED
            </span>
          )}
        </div>
      </div>

      {/* RIGHT — Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          style={{
            background: "#fff", color: "#000", border: "none",
            padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            transition: "transform 0.1s, opacity 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ fontSize: 10 }}>▶</span> Run
        </button>

        <button
          title="Settings"
          style={{
            background: "none", border: "none", color: "#666",
            cursor: "pointer", padding: 8, borderRadius: 6,
            fontSize: 18, transition: "color 0.2s, background 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#eee"; e.currentTarget.style.background = "#1a1a1a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.background = "none"; }}
        >
          ⚙
        </button>

        <div
          title="Account"
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #444, #222)",
            border: "1px solid #333", cursor: "pointer"
          }}
        />
      </div>
    </div>
  );
}