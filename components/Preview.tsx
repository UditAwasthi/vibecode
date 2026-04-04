"use client";

import { useFileStore } from "@/store/file.store";
import { useEffect, useRef, useState } from "react";

function buildSrcDoc(files: { name: string; content: string | null }[]) {
  const html = files.find((f) => f.name === "index.html")?.content ?? "";
  const css  = files.filter((f) => f.name.endsWith(".css")).map((f) => f.content).join("\n");
  const js   = files
    .filter((f) => /\.(tsx?|jsx?)$/.test(f.name))
    .map((f) => f.content)
    .join("\n");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <style>*{box-sizing:border-box}body{margin:0;font-family:sans-serif}${css}</style>
    <script>
      const _c = console;
      ['log','warn','error'].forEach(fn => {
        console[fn] = (...args) => {
          _c[fn](...args);
          try { window.parent.postMessage({ type: 'console', level: fn, msg: args.map(String).join(' ') }, '*'); } catch(e){}
        };
      });
      window.onerror = (msg, src, line, col) => {
        try { window.parent.postMessage({ type: 'console', level: 'error', msg: msg + ' (' + line + ':' + col + ')' }, '*'); } catch(e){}
      };
    </script>
  </head>
  <body>${html}<script type="text/javascript">${js}</script></body>
</html>`;
}

export default function Preview() {
  const { files, addLog } = useFileStore();
  const [srcDoc, setSrcDoc] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoading(true);
    setSrcDoc(buildSrcDoc(files));
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [files, refreshKey]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "console") addLog(e.data.level as "log"|"warn"|"error", e.data.msg);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [addLog]);

  const openInTab = () => {
    const blob = new Blob([buildSrcDoc(files)], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  return (
    <>
      <style>{`
        .preview-btn:hover { background: #21262d !important; color: #e6edf3 !important; }
        @keyframes previewProgress { from { width: 0; opacity: 1 } to { width: 100%; opacity: 0 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#161b22",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          height: 38,
          background: "#161b22",
          borderBottom: "1px solid #21262d",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="10" rx="2" stroke="#58a6ff" strokeWidth="1.2"/>
              <path d="M1 5h12" stroke="#58a6ff" strokeWidth="1.2"/>
              <circle cx="3.5" cy="3.5" r="0.7" fill="#f85149"/>
              <circle cx="5.5" cy="3.5" r="0.7" fill="#d29922"/>
              <circle cx="7.5" cy="3.5" r="0.7" fill="#3fb950"/>
            </svg>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#8b949e",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              fontFamily: '"Inter", system-ui',
            }}>
              Preview
            </span>
            {loading && (
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ animation: "spin 0.8s linear infinite" }}
              >
                <circle cx="6" cy="6" r="5" stroke="#58a6ff" strokeWidth="1.5" strokeDasharray="16 16" strokeLinecap="round"/>
              </svg>
            )}
          </div>

          <div style={{ display: "flex", gap: 2 }}>
            {[
              {
                icon: (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4.5A6 6 0 108 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M13.5 1.5v3h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Refresh",
                action: () => setRefreshKey((k) => k + 1),
              },
              {
                icon: (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 2h4v4M9 7l5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Open in new tab",
                action: openInTab,
              },
            ].map((btn, i) => (
              <button
                key={i}
                className="preview-btn"
                title={btn.title}
                onClick={btn.action}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8b949e",
                  cursor: "pointer",
                  padding: "5px 7px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {loading && (
          <div style={{ height: 2, background: "#21262d", flexShrink: 0, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #58a6ff, #a5d6ff)",
              borderRadius: 2,
              animation: "previewProgress 0.5s ease-out forwards",
            }}/>
          </div>
        )}

        {/* iframe */}
        <div style={{
          flex: 1,
          overflow: "hidden",
          background: "#fff",
          position: "relative",
        }}>
          <iframe
            ref={iframeRef}
            key={refreshKey}
            srcDoc={srcDoc}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#fff",
            }}
            sandbox="allow-scripts allow-same-origin"
            title="preview"
          />
        </div>
      </div>
    </>
  );
}