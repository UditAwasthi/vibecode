"use client";

import { useEffect, useRef, useState } from "react";
import { useFileStore } from "@/store/file.store";

type Tab = "CONSOLE" | "OUTPUT" | "PROBLEMS";

const LOG_COLORS = { log: "#cccccc", warn: "#cca700", error: "#f48771" }; // Slightly more vibrant VS Code-accurate colors
const LOG_ICONS  = { log: "›", warn: "⚠", error: "✕" };

export default function Terminal({ height, onResizeStart }: { height: number; onResizeStart: (e: React.MouseEvent) => void }) {
  const { terminalLogs, clearLogs } = useFileStore();
  const [activeTab, setActiveTab] = useState<Tab>("CONSOLE");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const tabs: Tab[] = ["CONSOLE", "OUTPUT", "PROBLEMS"];

  const errorCount = terminalLogs.filter((l) => l.type === "error").length;
  const warnCount  = terminalLogs.filter((l) => l.type === "warn").length;

  return (
    <div style={{ 
      height, 
      display: "flex", 
      flexDirection: "column", 
      background: "#181818", // Darker to match the bottom of the editor
      borderTop: "1px solid #2d2d2d", 
      flexShrink: 0,
      fontFamily: '"Inter", "Segoe UI", sans-serif'
    }}>
      {/* Tab bar + resize handle */}
      <div
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          height: 34, 
          borderBottom: "1px solid #252526", 
          flexShrink: 0, 
          background: "#1e1e1e", 
          cursor: "ns-resize",
          padding: "0 4px"
        }}
        onMouseDown={onResizeStart}
      >
        <div style={{ display: "flex", height: "100%", alignItems: "center" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0 12px", height: "100%", fontSize: 11, fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? "#e0e0e0" : "#858585",
                borderBottom: activeTab === tab ? "1px solid #007fd4" : "1px solid transparent",
                display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.02em",
                transition: "color 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => { if(activeTab !== tab) e.currentTarget.style.color = "#ccc"; }}
              onMouseLeave={(e) => { if(activeTab !== tab) e.currentTarget.style.color = "#858585"; }}
            >
              {tab}
              {tab === "CONSOLE" && terminalLogs.length > 0 && (
                <span style={{ 
                  background: activeTab === tab ? "#007fd4" : "#333", 
                  borderRadius: 10, padding: "0 6px", fontSize: 10, 
                  color: activeTab === tab ? "#fff" : "#aaa",
                  transition: "background 0.2s ease"
                }}>
                  {terminalLogs.length}
                </span>
              )}
              {tab === "PROBLEMS" && (errorCount > 0 || warnCount > 0) && (
                <div style={{ display: "flex", gap: 4 }}>
                  {errorCount > 0 && <span style={{ color: "#f48771", fontSize: 10 }}>{errorCount}</span>}
                  {warnCount > 0 && <span style={{ color: "#cca700", fontSize: 10 }}>{warnCount}</span>}
                </div>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 4, paddingRight: 8 }} onMouseDown={(e) => e.stopPropagation()}>
          <button
            title="Clear Logs"
            onClick={clearLogs}
            style={{ 
              background: "none", border: "none", color: "#858585", 
              cursor: "pointer", padding: "4px 8px", borderRadius: 4, 
              fontSize: 11, display: "flex", alignItems: "center", gap: 4,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#e0e0e0"; e.currentTarget.style.background = "#2d2d2d"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#858585"; e.currentTarget.style.background = "none"; }}
          >
            <span style={{ fontSize: 14 }}>⊘</span> Clear
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflow: "auto", 
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace", 
        fontSize: 12, 
        padding: "8px 0",
        scrollbarWidth: "thin",
        scrollbarColor: "#333 transparent"
      }}>
        {activeTab === "CONSOLE" && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {terminalLogs.length === 0 ? (
              <div style={{ color: "#555", padding: "12px 20px", fontStyle: "italic", fontSize: 11 }}>
                No console output to display.
              </div>
            ) : (
              terminalLogs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "3px 20px", color: LOG_COLORS[log.type],
                    borderLeft: "3px solid transparent",
                    borderColor: log.type === "error" ? "#f48771" : log.type === "warn" ? "#cca700" : "transparent",
                    background: log.type === "error" ? "rgba(244,135,113,0.04)" : log.type === "warn" ? "rgba(204,167,0,0.03)" : "transparent",
                    transition: "background 0.1s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = log.type === "error" ? "rgba(244,135,113,0.04)" : log.type === "warn" ? "rgba(204,167,0,0.03)" : "transparent"}
                >
                  <span style={{ opacity: 0.6, fontSize: 11, width: 10, textAlign: "center", flexShrink: 0 }}>{LOG_ICONS[log.type]}</span>
                  <span style={{ flex: 1, wordBreak: "break-all", lineHeight: 1.6 }}>{log.msg}</span>
                  <span style={{ fontSize: 10, opacity: 0.3, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                    {new Date(log.ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>
        )}

        {activeTab === "OUTPUT" && (
          <div style={{ color: "#555", padding: "12px 20px", fontStyle: "italic", fontSize: 11 }}>
            Output stream is empty.
          </div>
        )}

        {activeTab === "PROBLEMS" && (
          <div style={{ padding: "4px 0" }}>
            {terminalLogs.filter((l) => l.type !== "log").length === 0 ? (
              <div style={{ color: "#555", padding: "12px 20px", fontStyle: "italic", fontSize: 11 }}>
                No problems have been detected in the workspace.
              </div>
            ) : (
              terminalLogs.filter((l) => l.type !== "log").map((log, i) => (
                <div 
                  key={i} 
                  style={{ 
                    display: "flex", alignItems: "center", gap: 12, 
                    padding: "6px 20px", color: LOG_COLORS[log.type],
                    borderBottom: "1px solid #222" 
                  }}
                >
                  <span style={{ fontSize: 12 }}>{LOG_ICONS[log.type]}</span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ flex: 1, fontSize: 12, color: "#ccc" }}>{log.msg}</span>
                    <span style={{ fontSize: 10, opacity: 0.4 }}>Workspace &gt; {new Date(log.ts).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}