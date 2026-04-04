"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFileStore, IFile } from "@/store/file.store";

// ─── VS Code–style SVG Icons ──────────────────────────────────────────────────

function IconNewFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9A1.5 1.5 0 0014 13.5V6l-5-5z" stroke="currentColor" strokeWidth="1" fill="none"/>
      <path d="M9 1v4.5A.5.5 0 009.5 6H14" stroke="currentColor" strokeWidth="1"/>
      <line x1="8" y1="9" x2="8" y2="13" stroke="#73c991" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="6" y1="11" x2="10" y2="11" stroke="#73c991" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconNewFolder() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 3.5A1.5 1.5 0 012.5 2H6l1.5 2H13.5A1.5 1.5 0 0115 5.5v7A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5V3.5z" stroke="currentColor" strokeWidth="1" fill="none"/>
      <line x1="8" y1="7.5" x2="8" y2="11.5" stroke="#73c991" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="6" y1="9.5" x2="10" y2="9.5" stroke="#73c991" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconCollapseAll() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5h5v5H2zM9 5h5v5H9z" stroke="currentColor" strokeWidth="1" fill="none"/>
      <path d="M4.5 7.5L6.5 5.5M11.5 7.5L9.5 5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 4.5A6 6 0 108 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M13.5 1.5v3h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IconEllipsis() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3" cy="8" r="1.2"/>
      <circle cx="8" cy="8" r="1.2"/>
      <circle cx="13" cy="8" r="1.2"/>
    </svg>
  );
}

function IconChevronRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.5 3.5L10.5 8l-4 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IconChevronDown({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.5 6.5L8 10.5l4.5-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IconFolder({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1.5 3.5A1 1 0 012.5 2.5H6L7 4H14A1 1 0 0115 5v1H1V4a.5.5 0 01.5-.5z" fill="#dcb67a"/>
        <path d="M1 6h14l-1.5 7H2.5L1 6z" fill="#dcb67a"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 3.5A1 1 0 012.5 2.5H6L7 4H14.5A.5.5 0 0115 4.5v8A1 1 0 0114 13.5H2A1 1 0 011 12.5v-9z" fill="#dcb67a"/>
    </svg>
  );
}

// ─── File-type SVG icons (VS Code Seti-style) ─────────────────────────────────

const FILE_ICONS: Record<string, { svg: React.ReactElement }> = {
  tsx: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="2" fill="#1a86c8" opacity="0.15"/>
        <text x="8" y="11" textAnchor="middle" fill="#1a86c8" fontSize="7" fontWeight="800" fontFamily="monospace">TSX</text>
      </svg>
    ),
  },
  ts: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="2" fill="#3178c6" opacity="0.2"/>
        <text x="8" y="11" textAnchor="middle" fill="#3178c6" fontSize="7.5" fontWeight="800" fontFamily="monospace">TS</text>
      </svg>
    ),
  },
  jsx: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="2" fill="#61dafb" opacity="0.12"/>
        <text x="8" y="11" textAnchor="middle" fill="#61dafb" fontSize="7" fontWeight="800" fontFamily="monospace">JSX</text>
      </svg>
    ),
  },
  js: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="1.5" fill="#f7df1e" opacity="0.15"/>
        <text x="8" y="11" textAnchor="middle" fill="#d4b700" fontSize="7.5" fontWeight="800" fontFamily="monospace">JS</text>
      </svg>
    ),
  },
  json: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4.5 3C3.5 3 3 3.7 3 4.5v2c0 .8-.5 1.5-1.5 1.5.9 0 1.5.7 1.5 1.5v2c0 .8.5 1.5 1.5 1.5" stroke="#ffd700" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M11.5 3c1 0 1.5.7 1.5 1.5v2c0 .8.5 1.5 1.5 1.5-.9 0-1.5.7-1.5 1.5v2c0 .8-.5 1.5-1.5 1.5" stroke="#ffd700" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <circle cx="6.5" cy="8" r="0.8" fill="#ffd700"/>
        <circle cx="8" cy="8" r="0.8" fill="#ffd700"/>
        <circle cx="9.5" cy="8" r="0.8" fill="#ffd700"/>
      </svg>
    ),
  },
  css: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="1.5" fill="#264de4" opacity="0.15"/>
        <text x="8" y="11" textAnchor="middle" fill="#264de4" fontSize="7" fontWeight="800" fontFamily="monospace">CSS</text>
      </svg>
    ),
  },
  scss: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="1.5" fill="#cd6799" opacity="0.15"/>
        <text x="8" y="11" textAnchor="middle" fill="#cd6799" fontSize="6" fontWeight="800" fontFamily="monospace">SCSS</text>
      </svg>
    ),
  },
  html: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2l1 11 5 1.5L13 13l1-11H2z" fill="#e34c26" opacity="0.15"/>
        <text x="8" y="11" textAnchor="middle" fill="#e34c26" fontSize="6" fontWeight="800" fontFamily="monospace">HTML</text>
      </svg>
    ),
  },
  md: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3.5" width="14" height="9" rx="1.5" stroke="#9ca3af" strokeWidth="1" fill="none"/>
        <path d="M3 11V5.5l2.5 3 2.5-3V11M10 11V5.5l2 2.5" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  svg: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="#ffb13b" strokeWidth="1" fill="none"/>
        <path d="M5 8a3 3 0 106 0" stroke="#ffb13b" strokeWidth="1" strokeLinecap="round" fill="none"/>
        <circle cx="8" cy="5.5" r="1" fill="#ffb13b"/>
      </svg>
    ),
  },
  py: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5C5.5 1.5 4 2.7 4 4.5V6H8V6.5H3C2 6.5 1 7.2 1 9s1 3 2 3.5L4 14h3v-1.5H5.5C5 12.5 4.5 12 4.5 11.5V10H8c2.5 0 4-1.2 4-3V5.5C12 3 10.5 1.5 8 1.5z" fill="#3572a5" opacity="0.6"/>
        <path d="M8 14.5C10.5 14.5 12 13.3 12 11.5V10H8V9.5H13C14 9.5 15 8.8 15 7s-1-3-2-3.5L12 2H9v1.5h1.5c.5 0 1 .5 1 1V5.5H8c-2.5 0-4 1.2-4 3v2C4 13 5.5 14.5 8 14.5z" fill="#ffd43b" opacity="0.6"/>
        <circle cx="6.2" cy="4.2" r="0.8" fill="#ffd43b"/>
        <circle cx="9.8" cy="11.8" r="0.8" fill="#3572a5"/>
      </svg>
    ),
  },
  sh: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="2" fill="#89e051" opacity="0.1"/>
        <path d="M3.5 5.5l3 2.5-3 2.5" stroke="#89e051" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <line x1="8.5" y1="10.5" x2="12" y2="10.5" stroke="#89e051" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  yml: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="1.5" fill="#cb171e" opacity="0.1"/>
        <line x1="3" y1="5" x2="7" y2="5" stroke="#cb171e" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="3" y1="8" x2="9" y2="8" stroke="#cb171e" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="3" y1="11" x2="6" y2="11" stroke="#cb171e" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="5" y1="5" x2="5" y2="8" stroke="#cb171e" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  yaml: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="1.5" fill="#cb171e" opacity="0.1"/>
        <line x1="3" y1="5" x2="7" y2="5" stroke="#cb171e" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="3" y1="8" x2="9" y2="8" stroke="#cb171e" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="3" y1="11" x2="6" y2="11" stroke="#cb171e" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="5" y1="5" x2="5" y2="8" stroke="#cb171e" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  env: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="1.5" fill="#ead54f" opacity="0.12"/>
        <text x="8" y="11" textAnchor="middle" fill="#ead54f" fontSize="6.5" fontWeight="700" fontFamily="monospace">.env</text>
      </svg>
    ),
  },
  gitignore: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke="#f05033" strokeWidth="1" fill="none"/>
        <line x1="4.5" y1="11.5" x2="11.5" y2="4.5" stroke="#f05033" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  lock: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="7.5" width="10" height="7" rx="1.5" stroke="#6e6e6e" strokeWidth="1" fill="none"/>
        <path d="M5.5 7.5V5.5a2.5 2.5 0 015 0v2" stroke="#6e6e6e" strokeWidth="1" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  png: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="#a2c8d8" strokeWidth="1" fill="none"/>
        <path d="M1.5 10.5l4-4 3 3 2-2 3 3.5" stroke="#a2c8d8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="5.5" cy="5.5" r="1.2" fill="#a2c8d8"/>
      </svg>
    ),
  },
  jpg: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="#a2c8d8" strokeWidth="1" fill="none"/>
        <path d="M1.5 10.5l4-4 3 3 2-2 3 3.5" stroke="#a2c8d8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="5.5" cy="5.5" r="1.2" fill="#a2c8d8"/>
      </svg>
    ),
  },
  txt: {
    svg: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="#c5c5c5" strokeWidth="1" fill="none"/>
        <line x1="4.5" y1="5.5" x2="11.5" y2="5.5" stroke="#c5c5c5" strokeWidth="1" strokeLinecap="round"/>
        <line x1="4.5" y1="8" x2="11.5" y2="8" stroke="#c5c5c5" strokeWidth="1" strokeLinecap="round"/>
        <line x1="4.5" y1="10.5" x2="8.5" y2="10.5" stroke="#c5c5c5" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
};

const DEFAULT_FILE_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M9.5 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9A1.5 1.5 0 0014 13.5V5.5L9.5 1z" stroke="#c5c5c5" strokeWidth="1" fill="none"/>
    <path d="M9.5 1v4A.5.5 0 0010 5.5H14" stroke="#c5c5c5" strokeWidth="1" fill="none"/>
  </svg>
);

function FileIcon({ name }: { name: string }) {
  // Handle special dotfiles
  if (name === ".gitignore" || name === ".git") return <span style={{ display: "flex", alignItems: "center" }}>{FILE_ICONS.gitignore.svg}</span>;
  if (name.endsWith(".lock")) return <span style={{ display: "flex", alignItems: "center" }}>{FILE_ICONS.lock.svg}</span>;
  if (name === ".env" || name.startsWith(".env.")) return <span style={{ display: "flex", alignItems: "center" }}>{FILE_ICONS.env.svg}</span>;

  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const icon = FILE_ICONS[ext];
  return <span style={{ display: "flex", alignItems: "center" }}>{icon ? icon.svg : DEFAULT_FILE_ICON}</span>;
}

// ─── Tree building ─────────────────────────────────────────────────────────────
type TreeNode = { name: string; path: string; file?: IFile; children: TreeNode[] };

function buildTree(
  files: IFile[],
  searchQuery: string,
  sortBy: "name" | "type" | "modified",
  sortOrder: "asc" | "desc"
): TreeNode[] {
  const root: Record<string, any> = {};

  const filteredFiles = searchQuery
    ? files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  filteredFiles.forEach((file) => {
    const parts = file.path.split("/").filter(Boolean);
    let cur = root;
    parts.forEach((part, i) => {
      if (!cur[part]) cur[part] = { name: part, path: parts.slice(0, i + 1).join("/"), children: {} };
      if (i === parts.length - 1) cur[part].file = file;
      cur = cur[part].children;
    });
  });

  const convert = (obj: any): TreeNode[] =>
    Object.values(obj)
      .map((n: any) => ({ name: n.name, path: n.path, file: n.file, children: convert(n.children) }))
      .sort((a: TreeNode, b: TreeNode) => {
        const aF = a.file?.isFolder || a.children.length > 0;
        const bF = b.file?.isFolder || b.children.length > 0;
        if (aF && !bF) return -1;
        if (!aF && bF) return 1;
        let cmp = 0;
        if (sortBy === "type") {
          const aExt = a.file ? a.name.split(".").pop() || "" : "folder";
          const bExt = b.file ? b.name.split(".").pop() || "" : "folder";
          cmp = aExt.localeCompare(bExt);
        } else {
          cmp = a.name.localeCompare(b.name);
        }
        return sortOrder === "desc" ? -cmp : cmp;
      }) as TreeNode[];

  return convert(root);
}

// ─── Inline input for rename/create ──────────────────────────────────────────
function InlineInput({
  defaultValue = "",
  onConfirm,
  onCancel,
}: {
  defaultValue?: string;
  onConfirm: (v: string) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    // Select without extension for files
    const val = ref.current?.value ?? "";
    const dot = val.lastIndexOf(".");
    ref.current?.setSelectionRange(0, dot > 0 ? dot : val.length);
  }, []);
  return (
    <input
      ref={ref}
      defaultValue={defaultValue}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const v = e.currentTarget.value.trim();
          if (v) onConfirm(v);
          else onCancel();
        }
        if (e.key === "Escape") onCancel();
      }}
      onBlur={(e) => {
        const v = e.currentTarget.value.trim();
        if (v) onConfirm(v);
        else onCancel();
      }}
      style={{
        background: "#3c3c3c",
        border: "1px solid #0078d4",
        color: "#cccccc",
        fontSize: 13,
        padding: "1px 5px",
        outline: "none",
        width: "calc(100% - 4px)",
        borderRadius: 2,
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        height: 20,
        boxSizing: "border-box",
        boxShadow: "0 0 0 1px #0078d4",
      }}
    />
  );
}

// ─── Context Menu ─────────────────────────────────────────────────────────────
type CtxTarget = { file: IFile; isFolder: boolean; x: number; y: number };

const CTX_ICONS = {
  newFile: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9A1.5 1.5 0 0014 13.5V6l-5-5z" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M9 1v4.5A.5.5 0 009.5 6H14" stroke="currentColor" strokeWidth="1"/><line x1="8" y1="9" x2="8" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="6" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  newFolder: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 3.5A1.5 1.5 0 012.5 2H6l1.5 2H13.5A1.5 1.5 0 0115 5.5v7A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5V3.5z" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="8" y1="7.5" x2="8" y2="11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="6" y1="9.5" x2="10" y2="9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  rename: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" stroke="currentColor" strokeWidth="1" fill="none" strokeLinejoin="round"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="10" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M3 11H2.5A1.5 1.5 0 011 9.5V2.5A1.5 1.5 0 012.5 1h7A1.5 1.5 0 0111 2.5V3" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
  cut: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="4.5" cy="12.5" r="2" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="11.5" cy="12.5" r="2" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M2.5 2.5L8 8l5.5-5.5M8 8l-3.5 4.5M8 8l3.5 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none"/></svg>,
  paste: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="4" y="4" width="10" height="11" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="7" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="7" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  duplicate: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5.5" y="5.5" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="2.5" y="2.5" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
  reveal: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2.5 8.5L7 13l7.5-9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  delete: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3h4v2M5 5l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  openSide: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="1"/><path d="M10.5 7l2 1-2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  copyPath: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M7 9l-2 2a2.828 2.828 0 004 4l2-2a2.828 2.828 0 000-4l-.5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none"/><path d="M9 7l2-2a2.828 2.828 0 00-4-4L5 3a2.828 2.828 0 000 4l.5-.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none"/></svg>,
};

type MenuItemDef = { label: string; icon: React.ReactElement; action: () => void; danger?: boolean; disabled?: boolean; shortcut?: string };
type MenuSep = { type: "sep" };
type MenuEntry = MenuItemDef | MenuSep;

function ContextMenu({ target, onClose }: { target: CtxTarget; onClose: () => void }) {
  const { createFile, createFolder, renameFile, deleteFile, duplicateFile, copyFiles, cutFiles, pasteFiles, selectedFiles, clipboard, selectedFolder } =
    useFileStore();
  const ref = useRef<HTMLDivElement>(null);
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  // Position within viewport
  const [pos, setPos] = useState({ x: target.x, y: target.y });
  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: Math.min(target.x, window.innerWidth - r.width - 8),
      y: Math.min(target.y, window.innerHeight - r.height - 8),
    });
  }, [target.x, target.y]);

  if (renaming) {
    return (
      <div
        ref={ref}
        style={{
          position: "fixed", top: pos.y, left: pos.x, zIndex: 9999,
          background: "#252526", border: "1px solid #454545",
          borderRadius: 5, padding: "8px 10px", minWidth: 220,
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 11, color: "#858585", marginBottom: 5, fontFamily: '"Segoe UI", sans-serif' }}>Rename</div>
        <InlineInput
          defaultValue={target.file.name}
          onConfirm={(v) => { renameFile(target.file.id, v); onClose(); }}
          onCancel={onClose}
        />
      </div>
    );
  }

  const sel = selectedFiles.has(target.file.id) ? Array.from(selectedFiles) : [target.file.id];
  const canPaste = !!clipboard;

  const sep: MenuSep = { type: "sep" };

  const items: MenuEntry[] = target.isFolder
    ? [
        { icon: CTX_ICONS.newFile, label: "New File…", action: () => { createFile("newfile.tsx", target.file.path + "/newfile.tsx"); onClose(); } },
        { icon: CTX_ICONS.newFolder, label: "New Folder…", action: () => { createFolder("newfolder", target.file.path + "/newfolder"); onClose(); } },
        sep,
        { icon: CTX_ICONS.reveal, label: "Reveal in Explorer", action: () => onClose() },
        sep,
        { icon: CTX_ICONS.cut, label: "Cut", action: () => { cutFiles(sel); onClose(); }, shortcut: "⌘X" },
        { icon: CTX_ICONS.copy, label: "Copy", action: () => { copyFiles(sel); onClose(); }, shortcut: "⌘C" },
        { icon: CTX_ICONS.paste, label: "Paste", action: () => { if (canPaste) pasteFiles(target.file.path); onClose(); }, disabled: !canPaste, shortcut: "⌘V" },
        sep,
        { icon: CTX_ICONS.copyPath, label: "Copy Path", action: () => { navigator.clipboard?.writeText(target.file.path); onClose(); }, shortcut: "⌥⌘C" },
        { icon: CTX_ICONS.copyPath, label: "Copy Relative Path", action: () => { navigator.clipboard?.writeText(target.file.path.replace(/^\//, "")); onClose(); } },
        sep,
        { icon: CTX_ICONS.rename, label: "Rename…", action: () => setRenaming(true), shortcut: "F2" },
        { icon: CTX_ICONS.delete, label: "Delete", action: () => { sel.forEach((id) => deleteFile(id)); onClose(); }, danger: true, shortcut: "⌦" },
      ]
    : [
        { icon: CTX_ICONS.openSide, label: "Open to the Side", action: () => onClose() },
        sep,
        { icon: CTX_ICONS.reveal, label: "Reveal in Explorer", action: () => onClose() },
        sep,
        { icon: CTX_ICONS.cut, label: "Cut", action: () => { cutFiles(sel); onClose(); }, shortcut: "⌘X" },
        { icon: CTX_ICONS.copy, label: "Copy", action: () => { copyFiles(sel); onClose(); }, shortcut: "⌘C" },
        { icon: CTX_ICONS.paste, label: "Paste", action: () => { if (canPaste && selectedFolder) pasteFiles(selectedFolder.path); onClose(); }, disabled: !canPaste, shortcut: "⌘V" },
        { icon: CTX_ICONS.duplicate, label: "Duplicate", action: () => { duplicateFile(target.file.id); onClose(); } },
        sep,
        { icon: CTX_ICONS.copyPath, label: "Copy Path", action: () => { navigator.clipboard?.writeText(target.file.path); onClose(); }, shortcut: "⌥⌘C" },
        { icon: CTX_ICONS.copyPath, label: "Copy Relative Path", action: () => { navigator.clipboard?.writeText(target.file.path.replace(/^\//, "")); onClose(); } },
        sep,
        { icon: CTX_ICONS.rename, label: "Rename…", action: () => setRenaming(true), shortcut: "F2" },
        { icon: CTX_ICONS.delete, label: "Delete", action: () => { sel.forEach((id) => deleteFile(id)); onClose(); }, danger: true, shortcut: "⌦" },
      ];

  return (
    <div
      ref={ref}
      style={{
        position: "fixed", top: pos.y, left: pos.x, zIndex: 9999,
        background: "#252526", border: "1px solid #454545",
        borderRadius: 5, padding: "3px 0", minWidth: 220,
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        fontSize: 13,
      }}
    >
      {items.map((item, i) => {
        if ("type" in item) return <div key={i} style={{ height: 1, background: "#383838", margin: "3px 0" }} />;
        const mi = item as MenuItemDef;
        return (
          <div
            key={i}
            onClick={!mi.disabled ? mi.action : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "4px 12px 4px 10px",
              cursor: mi.disabled ? "default" : "pointer",
              color: mi.danger ? "#f14c4c" : mi.disabled ? "#555" : "#cccccc",
              opacity: mi.disabled ? 0.45 : 1,
              userSelect: "none",
            }}
            onMouseEnter={(e) => { if (!mi.disabled) e.currentTarget.style.background = mi.danger ? "rgba(241,76,76,0.12)" : "#094771"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ color: mi.danger ? "#f14c4c" : "#c5c5c5", display: "flex", flexShrink: 0 }}>{mi.icon}</span>
            <span style={{ flex: 1 }}>{mi.label}</span>
            {mi.shortcut && <span style={{ fontSize: 11, color: "#666", marginLeft: 12 }}>{mi.shortcut}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tree Node ────────────────────────────────────────────────────────────────
function TreeNodeRow({
  node, depth, onContextMenu, onDragStart, onDragOver, onDrop, onDragEnd,
  expandedFolders, onToggleExpansion, selectedFiles, onSelectionChange,
  creatingIn, onCreated, onCreateCancel, dragOp, draggedIds = [], clipboard,
}: {
  node: TreeNode;
  depth: number;
  onContextMenu: (t: CtxTarget) => void;
  onDragStart: (e: React.DragEvent, file: IFile) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetPath: string) => void;
  onDragEnd: () => void;
  expandedFolders: Set<string>;
  onToggleExpansion: (path: string) => void;
  selectedFiles: Set<string>;
  onSelectionChange: (id: string, additive: boolean) => void;
  creatingIn?: { path: string; kind: "file" | "folder" } | null;
  onCreated?: (name: string, kind: "file" | "folder", path: string) => void;
  onCreateCancel?: () => void;
  dragOp?: "move" | "copy" | null;
  draggedIds?: string[];
  clipboard?: { type: "cut" | "copy"; files: IFile[] } | null;
}) {
  const { openFile, activeFile, setSelectedFolder } = useFileStore();
  const [hovered, setHovered] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dropPos, setDropPos] = useState<"above" | "inside" | "below" | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const isFolder = !!(node.file?.isFolder || node.children.length > 0);
  const isActive = !isFolder && activeFile?.id === node.file?.id;
  const isSelected = !!(node.file && selectedFiles.has(node.file.id));
  const isExpanded = expandedFolders.has(node.path);
  const indent = depth * 8;
  const isBeingDragged = !!(node.file && draggedIds.includes(node.file.id));
  const isCut = !!(node.file && clipboard?.type === "cut" && clipboard.files.some(f => f.id === node.file!.id));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggleExpansion(node.path);
      if (node.file) setSelectedFolder(node.file);
    } else if (node.file) {
      openFile(node.file);
      setSelectedFolder(null);
    }
    if (node.file) onSelectionChange(node.file.id, e.ctrlKey || e.metaKey || e.shiftKey);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.file) onContextMenu({ file: node.file, isFolder, x: e.clientX, y: e.clientY });
  };

  const computeDropPos = (e: React.DragEvent): "above" | "inside" | "below" => {
    if (!rowRef.current) return "inside";
    const rect = rowRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pct = y / rect.height;
    if (isFolder) {
      if (pct < 0.25) return "above";
      if (pct > 0.75) return "below";
      return "inside";
    }
    return pct < 0.5 ? "above" : "below";
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = computeDropPos(e);
    setDropPos(pos);
    if (pos === "inside") setDragOver(true);
    else setDragOver(false);
    onDragOver(e);
  };

  const handleRowDragLeave = () => {
    setDragOver(false);
    setDropPos(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dropPos ?? computeDropPos(e);
    setDragOver(false);
    setDropPos(null);
    if (!node.file) return;
    if (isFolder && pos === "inside") {
      onDrop(e, node.file.path);
    } else {
      // Drop above/below: place into the parent folder
      const parentPath = node.file.path.split("/").slice(0, -1).join("/") || "/";
      onDrop(e, parentPath);
    }
    onDragEnd();
  };

  const bg = dragOver
    ? dragOp === "copy" ? "rgba(35,134,54,0.18)" : "rgba(0,120,212,0.2)"
    : isActive
    ? "#094771"
    : isSelected
    ? "#37373d"
    : hovered
    ? "#2a2d2e"
    : "transparent";

  const dropBorderColor = dragOver
    ? dragOp === "copy" ? "#23a455" : "#0078d4"
    : "transparent";

  const color = isActive ? "#ffffff" : "#cccccc";

  // Check if we should show a new-item input inside this folder
  const showCreatingHere = creatingIn?.path === node.path;

  return (
    <div>
      {/* Row */}
      {/* Above drop line */}
      {dropPos === "above" && (
        <div style={{
          height: 2, background: dragOp === "copy" ? "#23a455" : "#0078d4",
          margin: "0 4px", borderRadius: 1, pointerEvents: "none",
        }} />
      )}
      <div
        ref={rowRef}
        draggable={!!node.file}
        onDragStart={(e) => node.file && onDragStart(e, node.file)}
        onDragEnd={onDragEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDragOver={handleRowDragOver}
        onDragLeave={handleRowDragLeave}
        onDrop={handleDrop}
        style={{
          display: "flex", alignItems: "center",
          height: 22, cursor: "pointer",
          background: bg,
          color,
          userSelect: "none",
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          fontSize: 13,
          paddingRight: 8,
          boxSizing: "border-box",
          outline: dragOver && isFolder ? `1px solid ${dropBorderColor}` : isActive ? "1px solid #094771" : "none",
          outlineOffset: -1,
          position: "relative",
        }}
      >
        {/* Indent spacer + expand arrow */}
        <span style={{ display: "flex", alignItems: "center", paddingLeft: indent + 4, width: indent + 22, flexShrink: 0 }}>
          {isFolder ? (
            <span style={{ color: "#c5c5c5", display: "flex", alignItems: "center", opacity: 0.8 }}>
              {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            </span>
          ) : (
            <span style={{ width: 14 }} />
          )}
        </span>

        {/* File/folder icon */}
        <span style={{ display: "flex", alignItems: "center", marginRight: 6, flexShrink: 0 }}>
          {isFolder ? <IconFolder open={isExpanded} /> : <FileIcon name={node.name} />}
        </span>

        {/* Name */}
        <span style={{
          flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          lineHeight: "22px",
          color: isActive ? "#ffffff" : isCut ? "#858585" : "#cccccc",
          opacity: isBeingDragged && dragOp === "move" ? 0.4 : isCut ? 0.6 : 1,
          fontStyle: isCut ? "italic" : "normal",
        }}>
          {node.name}
        </span>

        {/* Drag operation badge */}
        {dragOver && isFolder && dragOp && (
          <span style={{
            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
            background: dragOp === "copy" ? "#23a455" : "#0078d4",
            color: "#fff", fontSize: 10, fontWeight: 700,
            padding: "1px 5px", borderRadius: 3,
            letterSpacing: "0.04em", pointerEvents: "none",
          }}>
            {dragOp === "copy" ? "COPY" : "MOVE"}
          </span>
        )}

        {/* Hover actions */}
        {hovered && isFolder && !dragOver && (
          <span style={{ display: "flex", gap: 1, marginLeft: 4, opacity: 0.7 }}>
            <span
              title="New File"
              onClick={(e) => { e.stopPropagation(); if (onCreated && onCreateCancel) { onToggleExpansion(node.path); /* signal parent */ onContextMenu({ file: node.file!, isFolder: true, x: -1, y: -1 }); } }}
              style={{ padding: "1px 2px", borderRadius: 2, color: "#c5c5c5" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9A1.5 1.5 0 0014 13.5V6l-5-5z" stroke="currentColor" strokeWidth="1" fill="none"/>
                <path d="M9 1v4.5A.5.5 0 009.5 6H14" stroke="currentColor" strokeWidth="1"/>
                <line x1="8" y1="9" x2="8" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <line x1="6" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
          </span>
        )}
      </div>
      {/* Below drop line */}
      {dropPos === "below" && (
        <div style={{
          height: 2, background: dragOp === "copy" ? "#23a455" : "#0078d4",
          margin: "0 4px", borderRadius: 1, pointerEvents: "none",
        }} />
      )}

      {/* Children */}
      {isFolder && isExpanded && (
        <div style={{ position: "relative" }}>
          {/* Indent guide line */}
          <div style={{
            position: "absolute",
            left: indent + 16,
            top: 0, bottom: 0,
            width: 1,
            background: "rgba(255,255,255,0.05)",
          }} />

          {/* New item input injected at top of folder */}
          {showCreatingHere && creatingIn && onCreated && onCreateCancel && (
            <div style={{ paddingLeft: indent + 24 + 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "flex" }}>
                  {creatingIn.kind === "folder" ? <IconFolder open={false} /> : <FileIcon name="newfile.tsx" />}
                </span>
                <InlineInput
                  onConfirm={(v) => onCreated(v, creatingIn.kind, node.path)}
                  onCancel={onCreateCancel}
                />
              </div>
            </div>
          )}

          {node.children.map((child) => (
            <TreeNodeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              onContextMenu={onContextMenu}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              expandedFolders={expandedFolders}
              onToggleExpansion={onToggleExpansion}
              selectedFiles={selectedFiles}
              onSelectionChange={onSelectionChange}
              creatingIn={creatingIn}
              onCreated={onCreated}
              onCreateCancel={onCreateCancel}
              dragOp={dragOp}
              draggedIds={draggedIds}
              clipboard={clipboard}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Header action button ─────────────────────────────────────────────────────
function HeaderBtn({ title, children, onClick }: { title: string; children: React.ReactNode; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,0.1)" : "none",
        border: "none", color: hov ? "#cccccc" : "#858585",
        cursor: "pointer", padding: "3px 4px", borderRadius: 4,
        display: "flex", alignItems: "center", justifyContent: "center",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

// ─── FileTree Root ────────────────────────────────────────────────────────────
export default function FileTree() {
  const {
    files, createFile, createFolder, setSelectedFolder, selectedFiles,
    setSelectedFiles, toggleFileSelection, clearSelection, searchQuery,
    setSearchQuery, sortBy, setSortBy, sortOrder, setSortOrder,
    expandedFolders, toggleFolderExpansion, expandAllFolders, collapseAllFolders,
    copyFiles, cutFiles, pasteFiles, clipboard, selectedFolder, deleteFile, moveFile,
    projectName,
  } = useFileStore();

  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [creatingIn, setCreatingIn] = useState<{ path: string; kind: "file" | "folder" } | null>(null);
  const [ctxTarget, setCtxTarget] = useState<CtxTarget | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dragOp, setDragOp] = useState<"move" | "copy" | null>(null);
  const [draggedIds, setDraggedIds] = useState<string[]>([]);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const handleCtx = useCallback((t: CtxTarget) => {
    // If x/y == -1 means triggered from hover icon — skip context menu, show inline create
    if (t.x === -1 && t.y === -1) return;
    setCtxTarget(t);
  }, []);
  const closeCtx = useCallback(() => setCtxTarget(null), []);

  const tree = buildTree(files, searchQuery, sortBy, sortOrder);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) setShowSortMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedFiles.size > 0) { e.preventDefault(); selectedFiles.forEach((id) => deleteFile(id)); }
      } else if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); copyFiles(Array.from(selectedFiles));
      } else if (e.key === "x" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); cutFiles(Array.from(selectedFiles));
      } else if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); if (clipboard && selectedFolder) pasteFiles(selectedFolder.path);
      } else if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); setSelectedFiles(files.map((f) => f.id));
      } else if (e.key === "Escape") {
        clearSelection();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [selectedFiles, files, copyFiles, cutFiles, pasteFiles, clipboard, selectedFolder, setSelectedFiles, clearSelection, deleteFile]);

  const handleDragStart = (e: React.DragEvent, file: IFile) => {
    const ids = selectedFiles.has(file.id) ? Array.from(selectedFiles) : [file.id];
    // Prevent dropping a folder into itself
    const draggedFile = files.find(f => f.id === file.id);
    e.dataTransfer.setData("application/vscode-filetree", JSON.stringify(ids));
    e.dataTransfer.setData("text/plain", JSON.stringify(ids));
    e.dataTransfer.effectAllowed = "copyMove";
    setDraggedIds(ids);
    setDragOp("move");

    // Custom drag ghost
    const ghost = document.createElement("div");
    ghost.style.cssText = `
      position: fixed; top: -9999px; left: -9999px; z-index: 99999;
      background: #2d2d2d; border: 1px solid #454545; border-radius: 4px;
      padding: 4px 10px; font-family: "Segoe UI", sans-serif; font-size: 12px;
      color: #cccccc; display: flex; align-items: center; gap: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5); pointer-events: none;
      white-space: nowrap;
    `;
    const label = ids.length > 1
      ? `${ids.length} items`
      : (draggedFile?.name ?? file.name);
    ghost.innerHTML = `<span style="color:#0078d4;font-size:14px">◻</span>${label}`;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    e.dataTransfer.setDragImage(ghost, 0, 0);
    // Clean up ghost after a tick (browser has captured it)
    setTimeout(() => { ghost.remove(); ghostRef.current = null; }, 0);
  };

  const handleDrop = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/vscode-filetree") || e.dataTransfer.getData("text/plain");
    const ids: string[] = JSON.parse(raw || "[]");

    // Guard: don't drop onto self or a child of self
    const isSelfDrop = ids.some((id) => {
      const f = files.find(f => f.id === id);
      return f && (f.path === targetPath || targetPath.startsWith(f.path + "/"));
    });
    if (isSelfDrop) { setDragOp(null); setDraggedIds([]); return; }

    const isCopy = e.altKey || dragOp === "copy";
    if (isCopy) {
      ids.forEach((id) => {
        const orig = files.find((f) => f.id === id);
        if (!orig) return;
        if (orig.isFolder) createFolder(orig.name, targetPath + "/" + orig.name);
        else createFile(orig.name, targetPath + "/" + orig.name);
      });
    } else {
      ids.forEach((id) => moveFile(id, targetPath));
    }
    setDragOp(null);
    setDraggedIds([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const op = e.altKey ? "copy" : "move";
    e.dataTransfer.dropEffect = op;
    if (op !== dragOp) setDragOp(op);
  };

  const handleDragEnd = () => {
    setDragOp(null);
    setDraggedIds([]);
  };

  // Alt key can change copy/move mid-drag anywhere on the page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (draggedIds.length === 0) return;
      if (e.key === "Alt") setDragOp(e.type === "keydown" ? "copy" : "move");
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKey);
    };
  }, [draggedIds]);

  const handleCreated = (name: string, kind: "file" | "folder", path: string) => {
    if (kind === "file") createFile(name, path + "/" + name);
    else createFolder(name, path + "/" + name);
    setCreatingIn(null);
    setCreating(null);
  };

return (
    <>
      <div
        style={{
          width: 260, // Slightly wider for better breathing room
          minWidth: 260,
          background: "#0f0f0f", // Ink-dark background for high contrast
          borderRight: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
          userSelect: "none",
        }}
      >
        {/* Panel title bar (EXPLORER header) */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 16px", height: 42, flexShrink: 0,
            background: "#0f0f0f",
            cursor: "pointer",
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ 
              color: collapsed ? "#555" : "#888", 
              display: "flex",
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)" 
            }}>
              <IconChevronDown size={14} />
            </span>
            <span style={{
              fontSize: 12, fontWeight: 600, color: collapsed ? "#666" : "#eee",
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
            }}>
              Explorer
            </span>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Project folder section header */}
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 10px 0 16px", height: 32, flexShrink: 0,
                marginBottom: 4,
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: 500, color: "#777",
                letterSpacing: "0.01em",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {projectName}
              </span>

              {/* Toolbar icons */}
              <div style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                <HeaderBtn title="New File" onClick={() => setCreating("file")}>
                  <IconNewFile />
                </HeaderBtn>
                <HeaderBtn title="New Folder" onClick={() => setCreating("folder")}>
                  <IconNewFolder />
                </HeaderBtn>
                <div style={{ position: "relative" }} ref={sortMenuRef}>
                  <HeaderBtn title="More Actions" onClick={() => setShowSortMenu(!showSortMenu)}>
                    <IconEllipsis />
                  </HeaderBtn>
                  
                  {showSortMenu && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 1000,
                      background: "#181818",
                      border: "1px solid #333",
                      borderRadius: 8, padding: "6px", minWidth: 200,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
                      fontSize: 13,
                    }}>
                      <div style={{ padding: "6px 10px", fontSize: 11, color: "#555", fontWeight: 600, textTransform: "uppercase" }}>Sort Order</div>
                      {(["name", "type", "modified"] as const).map((k) => (
                        <div
                          key={k}
                          onClick={() => { setSortBy(k); setShowSortMenu(false); }}
                          style={{
                            padding: "8px 10px", cursor: "pointer", color: sortBy === k ? "#fff" : "#aaa",
                            background: sortBy === k ? "#222" : "transparent",
                            borderRadius: 4,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            margin: "1px 0"
                          }}
                          onMouseEnter={(e) => { if(sortBy !== k) e.currentTarget.style.background = "#1e1e1e"; }}
                          onMouseLeave={(e) => { if(sortBy !== k) e.currentTarget.style.background = "transparent"; }}
                        >
                          {k.charAt(0).toUpperCase() + k.slice(1)}
                          {sortBy === k && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />}
                        </div>
                      ))}
                      <div style={{ height: 1, background: "#222", margin: "6px 4px" }} />
                      <div
                        onClick={() => { setShowSearch(!showSearch); setShowSortMenu(false); }}
                        style={{ padding: "8px 10px", cursor: "pointer", color: "#aaa", borderRadius: 4 }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e1e")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {showSearch ? "Disable Filter" : "Filter Files"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modern Search/Filter Input */}
            {showSearch && (
              <div style={{ padding: "0 12px 12px 12px", flexShrink: 0 }}>
                <div style={{ position: "relative" }}>
                  <input
                    autoFocus
                    placeholder="Search project..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%", background: "#161616",
                      border: "1px solid #222", color: "#eee",
                      fontSize: 12, padding: "7px 12px",
                      outline: "none", borderRadius: 6,
                      fontFamily: 'inherit',
                      transition: "all 0.15s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#444";
                      e.currentTarget.style.background = "#1a1a1a";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#222";
                      e.currentTarget.style.background = "#161616";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tree Section */}
            <div
              style={{ 
                flex: 1, overflowY: "auto", overflowX: "hidden", 
                padding: "0 8px 16px 8px", // Added horizontal padding for "floating" row look
                scrollbarWidth: "none", // Hide scrollbar for cleaner look
              }}
              onClick={() => { setSelectedFolder(null); clearSelection(); }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                {/* Creation row with subtle animation placeholder */}
                {creating && (
                  <div style={{ 
                    margin: "2px 0", padding: "6px 8px", 
                    borderRadius: 6, background: "rgba(255,255,255,0.03)",
                    border: "1px dashed #333" 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ opacity: 0.5 }}>
                        {creating === "folder" ? <IconFolder open={false} /> : <FileIcon name="temp.js" />}
                      </span>
                      <InlineInput
                        onConfirm={(v) => { if (creating === "file") createFile(v); else createFolder(v); setCreating(null); }}
                        onCancel={() => setCreating(null)}
                      />
                    </div>
                  </div>
                )}

                {tree.length === 0 && !creating && (
                  <div style={{ 
                    marginTop: 40, padding: "0 20px", fontSize: 12, color: "#444", 
                    textAlign: "center", lineHeight: 1.5 
                  }}>
                    {searchQuery ? "No results found" : "Empty workspace"}
                  </div>
                )}

                {tree.map((node) => (
                  <TreeNodeRow
                    key={node.path}
                    node={node}
                    depth={0}
                    onContextMenu={handleCtx}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    expandedFolders={expandedFolders}
                    onToggleExpansion={toggleFolderExpansion}
                    selectedFiles={selectedFiles}
                    onSelectionChange={(id, additive) => { if (additive) toggleFileSelection(id); else setSelectedFiles([id]); }}
                    creatingIn={creatingIn}
                    onCreated={handleCreated}
                    onCreateCancel={() => setCreatingIn(null)}
                    dragOp={dragOp}
                    draggedIds={draggedIds}
                    clipboard={clipboard}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {ctxTarget && <ContextMenu target={ctxTarget} onClose={closeCtx} />}
    </>
  );
}