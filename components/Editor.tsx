"use client";

import MonacoEditor, { loader } from "@monaco-editor/react";
import { useFileStore } from "@/store/file.store";
import { useRef, useState, useEffect, useCallback } from "react";
import type * as Monaco from "monaco-editor";

// Pre-configure Monaco worker paths for best perf
loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" },
});

function getLanguage(filename: string): string {
  const ext = filename?.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    json: "json", css: "css", scss: "scss", less: "less",
    html: "html", xml: "xml", svg: "xml",
    md: "markdown", mdx: "markdown",
    py: "python", rb: "ruby", go: "go", rs: "rust",
    java: "java", cpp: "cpp", c: "c", cs: "csharp",
    sh: "shell", bash: "shell", zsh: "shell",
    yml: "yaml", yaml: "yaml", toml: "ini",
    sql: "sql", graphql: "graphql",
    dockerfile: "dockerfile", env: "ini",
    prisma: "prisma",
  };
  return map[ext] ?? "plaintext";
}

function getFileIcon(filename: string): string {
  const ext = filename?.split(".").pop()?.toLowerCase() ?? "";
  const icons: Record<string, string> = {
    ts: "🔷", tsx: "⚛️", js: "🟨", jsx: "⚛️",
    json: "📋", css: "🎨", scss: "🎨", html: "🌐",
    md: "📝", py: "🐍", sh: "💻", yml: "⚙️", yaml: "⚙️",
    sql: "🗄️", go: "🐹", rs: "🦀", rb: "💎",
  };
  return icons[ext] ?? "📄";
}

export default function CodeEditor() {
  const { activeFile, updateFileContent, markSaved, setCursorPos } = useFileStore();
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const activeFileRef = useRef(activeFile);

  // Keep ref in sync so command handlers always see the latest file
  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  // ─── Save logic (debounced auto-save + manual Ctrl+S) ───────────────────────
  const triggerSave = useCallback(
    async (value: string, fileId: string, immediate = false) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const doSave = async () => {
        setStatus("saving");
        try {
          await fetch(`/api/file/update/${fileId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: value }),
          });
          markSaved(fileId);
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 1500);
        } catch {
          setStatus("idle");
        }
      };

      if (immediate) {
        await doSave();
      } else {
        timeoutRef.current = setTimeout(doSave, 700);
      }
    },
    [markSaved]
  );

  // ─── Editor mount: register ALL VS Code shortcuts ───────────────────────────
  const handleMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Cursor position tracking
      editor.onDidChangeCursorPosition((e) => {
        setCursorPos(e.position.lineNumber, e.position.column);
      });

      const { KeyMod, KeyCode } = monaco;

      // ── Ctrl+S / Cmd+S → immediate save ──────────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
        const file = activeFileRef.current;
        if (!file) return;
        const content = editor.getValue();
        updateFileContent(file.id, content);
        triggerSave(content, file.id, true);
      });

      // ── Ctrl+Shift+S → save all (same as save for single file) ───────────
      editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyS, () => {
        const file = activeFileRef.current;
        if (!file) return;
        const content = editor.getValue();
        updateFileContent(file.id, content);
        triggerSave(content, file.id, true);
      });

      // ── Shift+Alt+F / Shift+Option+F → Format Document ───────────────────
      editor.addCommand(KeyMod.Shift | KeyMod.Alt | KeyCode.KeyF, () => {
        editor.getAction("editor.action.formatDocument")?.run();
      });

      // ── Ctrl+Shift+P / Cmd+Shift+P → Command Palette ─────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyP, () => {
        editor.getAction("editor.action.quickCommand")?.run();
      });

      // ── Ctrl+P / Cmd+P → Go to File (repurposed as Go to Line here) ──────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyP, () => {
        editor.getAction("editor.action.gotoLine")?.run();
      });

      // ── Ctrl+G → Go to Line ───────────────────────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyG, () => {
        editor.getAction("editor.action.gotoLine")?.run();
      });

      // ── Ctrl+/ → Toggle Line Comment ─────────────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.Slash, () => {
        editor.getAction("editor.action.commentLine")?.run();
      });

      // ── Ctrl+Shift+/ → Toggle Block Comment ──────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Slash, () => {
        editor.getAction("editor.action.blockComment")?.run();
      });

      // ── Ctrl+D → Add Selection to Next Find Match ─────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyD, () => {
        editor.getAction("editor.action.addSelectionToNextFindMatch")?.run();
      });

      // ── Ctrl+Shift+L → Select All Occurrences ────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyL, () => {
        editor.getAction("editor.action.selectHighlights")?.run();
      });

      // ── Alt+Up / Alt+Down → Move Line ────────────────────────────────────
      editor.addCommand(KeyMod.Alt | KeyCode.UpArrow, () => {
        editor.getAction("editor.action.moveLinesUpAction")?.run();
      });
      editor.addCommand(KeyMod.Alt | KeyCode.DownArrow, () => {
        editor.getAction("editor.action.moveLinesDownAction")?.run();
      });

      // ── Shift+Alt+Up / Down → Copy Line Up/Down ───────────────────────────
      editor.addCommand(KeyMod.Shift | KeyMod.Alt | KeyCode.UpArrow, () => {
        editor.getAction("editor.action.copyLinesUpAction")?.run();
      });
      editor.addCommand(KeyMod.Shift | KeyMod.Alt | KeyCode.DownArrow, () => {
        editor.getAction("editor.action.copyLinesDownAction")?.run();
      });

      // ── Ctrl+Shift+K → Delete Line ────────────────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyK, () => {
        editor.getAction("editor.action.deleteLines")?.run();
      });

      // ── Ctrl+Enter → Insert Line Below ────────────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => {
        editor.getAction("editor.action.insertLineAfter")?.run();
      });

      // ── Ctrl+Shift+Enter → Insert Line Above ──────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter, () => {
        editor.getAction("editor.action.insertLineBefore")?.run();
      });

      // ── F12 → Go to Definition ────────────────────────────────────────────
      editor.addCommand(KeyCode.F12, () => {
        editor.getAction("editor.action.revealDefinition")?.run();
      });

      // ── Alt+F12 → Peek Definition ─────────────────────────────────────────
      editor.addCommand(KeyMod.Alt | KeyCode.F12, () => {
        editor.getAction("editor.action.peekDefinition")?.run();
      });

      // ── Shift+F12 → Find All References ──────────────────────────────────
      editor.addCommand(KeyMod.Shift | KeyCode.F12, () => {
        editor.getAction("editor.action.referenceSearch.trigger")?.run();
      });

      // ── F2 → Rename Symbol ────────────────────────────────────────────────
      editor.addCommand(KeyCode.F2, () => {
        editor.getAction("editor.action.rename")?.run();
      });

      // ── Ctrl+Space → Trigger Suggest ──────────────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.Space, () => {
        editor.getAction("editor.action.triggerSuggest")?.run();
      });

      // ── Ctrl+Shift+Space → Trigger Parameter Hints ────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Space, () => {
        editor.getAction("editor.action.triggerParameterHints")?.run();
      });

      // ── Ctrl+H → Find & Replace ───────────────────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyH, () => {
        editor.getAction("editor.action.startFindReplaceAction")?.run();
      });

      // ── Ctrl+F → Find ─────────────────────────────────────────────────────
      // (Monaco handles this natively, but ensure it's not blocked)
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyF, () => {
        editor.getAction("actions.find")?.run();
      });

      // ── Ctrl+[ / Ctrl+] → Indent / Outdent ───────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.BracketLeft, () => {
        editor.getAction("editor.action.outdentLines")?.run();
      });
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.BracketRight, () => {
        editor.getAction("editor.action.indentLines")?.run();
      });

      // ── Ctrl+K Ctrl+C → Add Line Comment ─────────────────────────────────
      // ── Ctrl+K Ctrl+U → Remove Line Comment ──────────────────────────────
      // (These are chord shortcuts — Monaco handles them internally via Ctrl+K prefix)

      // ── Ctrl+Shift+[ / ] → Fold / Unfold ─────────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.BracketLeft, () => {
        editor.getAction("editor.fold")?.run();
      });
      editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.BracketRight, () => {
        editor.getAction("editor.unfold")?.run();
      });

      // ── Ctrl+K Ctrl+0 → Fold All ─────────────────────────────────────────
      // ── Ctrl+K Ctrl+J → Unfold All ───────────────────────────────────────
      // (Chord shortcuts — Monaco handles these internally)

      // ── Ctrl+Z / Ctrl+Y → Undo / Redo (ensure not hijacked) ─────────────
      // Monaco handles these natively; just ensure they aren't blocked

      // ── Ctrl+A → Select All ───────────────────────────────────────────────
      // Monaco handles this natively

      // ── Ctrl+X / Ctrl+C / Ctrl+V → Cut / Copy / Paste ────────────────────
      // Monaco handles these natively — DO NOT override paste here

      // ── Escape → Clear multi-cursor / dismiss suggest ─────────────────────
      // Monaco handles this natively

      // ── Tab / Shift+Tab → Indent selection ────────────────────────────────
      // Monaco handles these natively

      // ── Home / End / Ctrl+Home / Ctrl+End → Navigation ───────────────────
      // Monaco handles these natively

      // ── Ctrl+L → Select current line ─────────────────────────────────────
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyL, () => {
        editor.getAction("expandLineSelection")?.run();
      });

      // ── Multi-cursor: Alt+Click, Ctrl+Alt+Up/Down ─────────────────────────
      // Monaco handles these natively

      // ── Column selection: Shift+Alt+drag, Ctrl+Shift+Alt+Arrow ───────────
      // Monaco handles these natively

      // Focus the editor after mount
      editor.focus();
    },
    [setCursorPos, updateFileContent, triggerSave]
  );

  // ─── Content change handler ──────────────────────────────────────────────
  const handleChange = useCallback(
    (value: string | undefined) => {
      const file = activeFileRef.current;
      if (!file || typeof value !== "string") return;
      updateFileContent(file.id, value);
      setStatus("saving");
      triggerSave(value, file.id);
    },
    [updateFileContent, triggerSave]
  );

  // ─── Empty state ─────────────────────────────────────────────────────────
  if (!activeFile) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1e1e",
          gap: 12,
          userSelect: "none",
        }}
      >
        <div style={{ fontSize: 48, opacity: 0.15 }}>⌨</div>
        <div style={{ fontSize: 13, color: "#555", fontFamily: "system-ui" }}>
          Open a file to start editing
        </div>
        <div style={{ fontSize: 11, color: "#3a3a3a", fontFamily: "system-ui" }}>
          Select from the explorer or create a new file
        </div>
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 24px",
            fontSize: 11,
            color: "#444",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {[
            ["Ctrl+S", "Save"],
            ["Ctrl+Z", "Undo"],
            ["Ctrl+/", "Comment"],
            ["Ctrl+D", "Multi-select"],
            ["Shift+Alt+F", "Format"],
            ["F12", "Go to Definition"],
          ].map(([key, label]) => (
            <span key={key}>
              <span style={{ color: "#3a3a3a" }}>{key}</span>
              <span style={{ color: "#333", marginLeft: 6 }}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  const breadcrumbs = activeFile.path.split("/").filter(Boolean);
  const lang = getLanguage(activeFile.name);
  const icon = getFileIcon(activeFile.name);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#1e1e1e",
        fontFamily: '"Segoe UI", system-ui, sans-serif',
      }}
    >
      {/* ── Breadcrumb bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          height: 34,
          background: "#252526",
          borderBottom: "1px solid #1e1e1e",
          flexShrink: 0,
          boxShadow: "0 1px 0 rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        {/* Breadcrumbs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: "#858585",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 13, marginRight: 2, flexShrink: 0 }}>{icon}</span>
          {breadcrumbs.map((part, i) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
            >
              {i > 0 && (
                <span style={{ color: "#555", fontSize: 10, paddingTop: 1 }}>›</span>
              )}
              <span
                style={{
                  color: i === breadcrumbs.length - 1 ? "#cccccc" : "#6a6a6a",
                  fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                  cursor: i < breadcrumbs.length - 1 ? "pointer" : "default",
                  transition: "color 0.15s",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onMouseEnter={(e) => {
                  if (i < breadcrumbs.length - 1)
                    e.currentTarget.style.color = "#cccccc";
                }}
                onMouseLeave={(e) => {
                  if (i < breadcrumbs.length - 1)
                    e.currentTarget.style.color = "#6a6a6a";
                }}
              >
                {part}
              </span>
            </span>
          ))}
        </div>

        {/* Right side: save status + language */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            fontSize: 11,
          }}
        >
          {status === "saving" && (
            <span
              style={{
                color: "#d7ba7d",
                display: "flex",
                alignItems: "center",
                gap: 5,
                opacity: 0.85,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#d7ba7d",
                  display: "inline-block",
                  animation: "pulse 1s ease-in-out infinite",
                }}
              />
              Saving…
            </span>
          )}
          {status === "saved" && (
            <span
              style={{
                color: "#4ec994",
                display: "flex",
                alignItems: "center",
                gap: 4,
                opacity: 0.9,
              }}
            >
              ✓ Saved
            </span>
          )}
          <span
            style={{
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              paddingLeft: 10,
              borderLeft: "1px solid #333",
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {lang}
          </span>
        </div>
      </div>

      {/* ── Monaco Editor ──────────────────────────────────────────────────────
          IMPORTANT: No onPaste wrapper — Monaco handles paste natively.
          Any e.preventDefault() on a parent div breaks Ctrl+V / right-click paste.
      ───────────────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <MonacoEditor
          height="100%"
          language={lang}
          value={activeFile.content ?? ""}
          onChange={handleChange}
          onMount={handleMount}
          theme="vs-dark"
          path={activeFile.id} // unique model per file → preserves undo history
          options={{
            // ── Typography ────────────────────────────────────────────────
            fontSize: 14,
            fontFamily:
              "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            fontLigatures: true,
            fontWeight: "400",
            lineHeight: 22,

            // ── Layout ────────────────────────────────────────────────────
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            lineNumbersMinChars: 4,
            padding: { top: 12, bottom: 32 },
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,

            // ── Scrollbar ─────────────────────────────────────────────────
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              verticalSliderSize: 6,
              horizontalSliderSize: 6,
              useShadows: false,
            },
            overviewRulerLanes: 3,

            // ── Cursor ────────────────────────────────────────────────────
            cursorBlinking: "phase",
            cursorSmoothCaretAnimation: "on",
            cursorStyle: "line",
            cursorWidth: 2,

            // ── Rendering ─────────────────────────────────────────────────
            renderLineHighlight: "all",
            renderWhitespace: "selection",
            renderLineHighlightOnlyWhenFocus: false,
            smoothScrolling: true,

            // ── Bracket + guides ──────────────────────────────────────────
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              bracketPairsHorizontal: true,
              indentation: true,
              highlightActiveIndentation: true,
            },
            matchBrackets: "always",

            // ── IntelliSense & completions ────────────────────────────────
            quickSuggestions: {
              other: "on",
              comments: "off",
              strings: "on",
            },
            quickSuggestionsDelay: 50,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            acceptSuggestionOnCommitCharacter: true,
            snippetSuggestions: "top",
            suggest: {
              showMethods: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showKeywords: true,
              showWords: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showSnippets: true,
              filterGraceful: true,
              insertMode: "insert",
              selectionMode: "whenQuickSuggestion",
            },
            inlineSuggest: { enabled: true },
            parameterHints: { enabled: true, cycle: true },
            wordBasedSuggestions: "matchingDocuments",

            // ── Auto-closing / wrapping ────────────────────────────────────
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoSurround: "languageDefined",
            autoClosingDelete: "always",
            autoClosingOvertype: "always",

            // ── Formatting ────────────────────────────────────────────────
            formatOnPaste: true,
            formatOnType: false, // true can be jarring; Shift+Alt+F on demand

            // ── Code folding ──────────────────────────────────────────────
            folding: true,
            foldingStrategy: "indentation",
            showFoldingControls: "mouseover",
            foldingHighlight: true,

            // ── Find widget ────────────────────────────────────────────────
            find: {
              addExtraSpaceOnTop: true,
              autoFindInSelection: "multiline",
              seedSearchStringFromSelection: "selection",
            },

            // ── Links & hovers ─────────────────────────────────────────────
            links: true,
            hover: { enabled: true, delay: 300, sticky: true },
            colorDecorators: true,

            // ── Miscellaneous ─────────────────────────────────────────────
            contextmenu: true,
            readOnly: false,
            copyWithSyntaxHighlighting: true,
            multiCursorModifier: "alt",       // Alt+click for multi-cursor (VS Code default)
            multiCursorMergeOverlapping: true,
            columnSelection: false,
            selectionHighlight: true,
            occurrencesHighlight: "singleFile",
            codeLens: true,

            stickyScroll: { enabled: true },
            definitionLinkOpensInPeek: false,
            peekWidgetDefaultFocus: "tree",
            accessibilitySupport: "auto",
            mouseWheelZoom: true,            // Ctrl+scroll to zoom font size
            tabCompletion: "on",
            emptySelectionClipboard: true,    // Ctrl+C on empty line copies whole line
            useTabStops: true,
            wordSeparators: "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?",
          }}
        />
      </div>

      {/* Pulse animation for saving dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}