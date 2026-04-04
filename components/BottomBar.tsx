"use client";

import { useFileStore } from "@/store/file.store";

function getLanguage(filename?: string): string {
  if (!filename) return "Plain Text";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "TypeScript", tsx: "TypeScript React", js: "JavaScript",
    jsx: "JavaScript React", json: "JSON", css: "CSS",
    html: "HTML", md: "Markdown", py: "Python", sh: "Shell",
    yml: "YAML", yaml: "YAML",
  };
  return map[ext] ?? "Plain Text";
}

export default function BottomBar() {
  const { activeFile, cursorPos, unsavedIds, openTabs } = useFileStore();
  const unsavedCount = openTabs.filter((f) => unsavedIds.has(f.id)).length;
  const isUnsaved = activeFile ? unsavedIds.has(activeFile.id) : false;

 return (
    <div
      style={{
        height: 24,
        background: "#0f0f0f",
        borderTop: "1px solid #222",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 500,
        color: "#666",
        userSelect: "none",
        zIndex: 100,
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div 
          style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", transition: "color 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#aaa"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
        >
          <span style={{ fontSize: 12 }}>⌥</span>
          <span>main</span>
        </div>
        
        {unsavedCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#d7ba7d" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d7ba7d" }} />
            <span>{unsavedCount} pending</span>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ letterSpacing: "0.05em" }}>
          {cursorPos.line}:{cursorPos.col}
        </div>
        
        <div 
          style={{ 
            background: "#222", padding: "1px 8px", borderRadius: 4, 
            color: "#aaa", fontSize: 10, fontWeight: 700
          }}
        >
          {getLanguage(activeFile?.name).toUpperCase()}
        </div>
      </div>
    </div>
  );
}