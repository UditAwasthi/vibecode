"use client";

import { useRef } from "react";
import { useFileStore } from "@/store/file.store";

const EXT_COLORS: Record<string, string> = {
  tsx: "#58a6ff", ts: "#3b82f6", jsx: "#38bdf8", js: "#fbbf24",
  json: "#f59e0b", css: "#818cf8", scss: "#e879f9",
  html: "#fb7185", md: "#6b7280", py: "#34d399",
  sh: "#a3e635", yml: "#94a3b8", yaml: "#94a3b8",
};

function fileColor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_COLORS[ext] ?? "#58a6ff";
}

function FileTypeIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const color = fileColor(name);
  const label = ext.length <= 3 ? ext.toUpperCase() : ext.slice(0,3).toUpperCase();
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <rect x="0.5" y="0.5" width="13" height="13" rx="2.5" fill={color} fillOpacity="0.12" stroke={color} strokeOpacity="0.25" strokeWidth="0.8"/>
      <text x="7" y="9.5" textAnchor="middle" fill={color} fontSize="4.5" fontWeight="800" fontFamily="monospace">{label}</text>
    </svg>
  );
}

export default function Tabs() {
  const { openTabs, activeFile, setActiveFile, closeFile, unsavedIds } = useFileStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) scrollRef.current.scrollLeft += e.deltaY;
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button === 1) { e.preventDefault(); closeFile(id); }
  };

  return (
    <>
      <style>{`
        .tab-item:hover .tab-close { opacity: 1 !important; }
        .tab-close:hover { background: rgba(139,148,158,0.2) !important; }
      `}</style>

      <div
        ref={scrollRef}
        onWheel={handleWheel}
        style={{
          display: "flex",
          background: "#161b22",
          borderBottom: "1px solid #21262d",
          overflowX: "auto",
          overflowY: "hidden",
          flexShrink: 0,
          height: 38,
          scrollbarWidth: "none",
          gap: 1,
          padding: "0 8px",
          alignItems: "flex-end",
        }}
      >
        {openTabs.map((file) => {
          const isActive = activeFile?.id === file.id;
          const isDirty = unsavedIds.has(file.id);
          const color = fileColor(file.name);

          return (
            <div
              key={file.id}
              className="tab-item"
              onClick={() => setActiveFile(file)}
              onMouseDown={(e) => handleMouseDown(e, file.id)}
              title={file.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 8px 0 10px",
                height: isActive ? 34 : 32,
                minWidth: 100,
                maxWidth: 180,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: '"Inter", system-ui, sans-serif',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#e6edf3" : "#8b949e",
                background: isActive ? "#1c2128" : "transparent",
                borderRadius: "6px 6px 0 0",
                borderTop: isActive ? `2px solid ${color}` : "2px solid transparent",
                flexShrink: 0,
                userSelect: "none",
                position: "relative",
                transition: "all 0.15s ease",
                boxShadow: isActive ? "inset 0 -1px 0 #1c2128" : "none",
                marginBottom: isActive ? -1 : 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#adbac7";
                  e.currentTarget.style.background = "rgba(33,38,45,0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#8b949e";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <FileTypeIcon name={file.name} />

              <span style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}>
                {file.name}
              </span>

              {/* Dirty indicator / close button */}
              {isDirty ? (
                <div
                  className="tab-close"
                  onClick={(e) => { e.stopPropagation(); closeFile(file.id); }}
                  style={{
                    width: 16, height: 16,
                    borderRadius: 4,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#d29922",
                  }}/>
                </div>
              ) : (
                <div
                  className="tab-close"
                  onClick={(e) => { e.stopPropagation(); closeFile(file.id); }}
                  style={{
                    width: 16, height: 16,
                    borderRadius: 4,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    opacity: 0,
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    color: "#8b949e",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}