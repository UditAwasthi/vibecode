"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFileStore } from "@/store/file.store";
import TopBar from "@/components/TopBar";
import BottomBar from "@/components/BottomBar";
import FileTree from "@/components/FileTree";
import Tabs from "@/components/Tabs";
import CodeEditor from "@/components/Editor";
import Preview from "@/components/Preview";
import Terminal from "@/components/Terminal";

const MIN_EDITOR = 200;
const MIN_PREVIEW = 160;
const MIN_TERMINAL = 80;
const DEFAULT_TERMINAL_H = 180;

export default function PlaygroundClient({ files, projectId }: { files: any[], projectId: string }) {
  const { setFiles } = useFileStore();

  // Editor/Preview split (percentage of available width)
  const [editorPct, setEditorPct] = useState(55);
  // Terminal height (px)
  const [terminalH, setTerminalH] = useState(DEFAULT_TERMINAL_H);
  const [terminalOpen, setTerminalOpen] = useState(true);

  const mainRef = useRef<HTMLDivElement>(null);
  const draggingH = useRef(false); // horizontal divider
  const draggingV = useRef(false); // vertical (terminal) divider
  const startX = useRef(0);
  const startY = useRef(0);
  const startPct = useRef(editorPct);
  const startTermH = useRef(terminalH);

  useEffect(() => { setFiles(files, projectId); }, [files, projectId, setFiles]);

  // ─── Horizontal resize (editor | preview) ───────────────────────────
  const startHDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingH.current = true;
    startX.current = e.clientX;
    startPct.current = editorPct;
  }, [editorPct]);

  // ─── Vertical resize (terminal) ─────────────────────────────────────
  const startVDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingV.current = true;
    startY.current = e.clientY;
    startTermH.current = terminalH;
  }, [terminalH]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingH.current && mainRef.current) {
        const total = mainRef.current.offsetWidth;
        const dx = e.clientX - startX.current;
        const newPct = Math.min(
          Math.max(startPct.current + (dx / total) * 100, (MIN_EDITOR / total) * 100),
          100 - (MIN_PREVIEW / total) * 100
        );
        setEditorPct(newPct);
      }
      if (draggingV.current && mainRef.current) {
        const dy = startY.current - e.clientY;
        const newH = Math.min(
          Math.max(startTermH.current + dy, MIN_TERMINAL),
          (mainRef.current.offsetHeight ?? 600) * 0.6
        );
        setTerminalH(newH);
      }
    };
    const onUp = () => { draggingH.current = false; draggingV.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#1e1e1e", color: "#cccccc", fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace", overflow: "hidden" }}>
      {/* TOP BAR */}
      <TopBar />

      {/* MAIN BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* SIDEBAR */}
        <FileTree />

        {/* RIGHT PANEL */}
        <div ref={mainRef} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* TABS */}
          <Tabs />

          {/* EDITOR + PREVIEW */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

            {/* EDITOR */}
            <div style={{ width: `${editorPct}%`, minWidth: MIN_EDITOR, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <CodeEditor />
            </div>

            {/* DIVIDER */}
            <div
              onMouseDown={startHDrag}
              style={{
                width: 4, background: "#1a1a1a", cursor: "col-resize", flexShrink: 0,
                transition: "background 0.1s", zIndex: 10,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0078d4")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a1a")}
            />

            {/* PREVIEW */}
            <div style={{ flex: 1, minWidth: MIN_PREVIEW, overflow: "hidden" }}>
              <Preview />
            </div>
          </div>

          {/* TERMINAL */}
          {terminalOpen && (
            <Terminal
              height={terminalH}
              onResizeStart={startVDrag}
            />
          )}

          {/* Terminal toggle when closed */}
          {!terminalOpen && (
            <div
              onClick={() => setTerminalOpen(true)}
              style={{ height: 24, background: "#252526", borderTop: "1px solid #1a1a1a", display: "flex", alignItems: "center", paddingLeft: 14, fontSize: 11, color: "#666", cursor: "pointer", flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
            >
              ▲ Open Terminal
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <BottomBar />
    </div>
  );
}