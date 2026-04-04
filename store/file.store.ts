import { create } from "zustand";

export type IFile = {
  id: string;
  name: string;
  path: string;
  content: string | null;
  isFolder?: boolean;
};

export type CursorPos = { line: number; col: number };

type FileStore = {
  files: IFile[];
  activeFile: IFile | null;
  openTabs: IFile[];
  unsavedIds: Set<string>;
  cursorPos: CursorPos;
  projectName: string;
  projectId: string | null;
  terminalLogs: { type: "log" | "error" | "warn"; msg: string; ts: number }[];
  selectedFolder: IFile | null;
  selectedFiles: Set<string>; // Multi-selection
  clipboard: { type: 'cut' | 'copy'; files: IFile[] } | null; // Clipboard for cut/copy
  searchQuery: string; // Search filter
  sortBy: 'name' | 'type' | 'modified'; // Sort options
  sortOrder: 'asc' | 'desc';
  expandedFolders: Set<string>; // Track expanded folders
  setSelectedFolder: (folder: IFile | null) => void;
  setFiles: (files: IFile[], projectId?: string) => void;
  setActiveFile: (file: IFile) => void;
  openFile: (file: IFile) => void;
  closeFile: (id: string) => void;
  createFile: (name: string, path?: string) => void;
  createFolder: (name: string, path?: string) => void;
  updateFileContent: (id: string, content: string) => void;
  markSaved: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  deleteFile: (id: string) => void;
  duplicateFile: (id: string) => void;
  moveFile: (id: string, newPath: string) => void; // Move file/folder
  copyFiles: (ids: string[]) => void; // Copy to clipboard
  cutFiles: (ids: string[]) => void; // Cut to clipboard
  pasteFiles: (targetPath: string) => void; // Paste from clipboard
  setSelectedFiles: (ids: string[], additive?: boolean) => void; // Multi-select
  toggleFileSelection: (id: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'name' | 'type' | 'modified') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleFolderExpansion: (path: string) => void;
  expandAllFolders: () => void;
  collapseAllFolders: () => void;
  setCursorPos: (line: number, col: number) => void;
  setProjectName: (name: string) => void;
  addLog: (type: "log" | "error" | "warn", msg: string) => void;
  clearLogs: () => void;
};

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  activeFile: null,
  openTabs: [],
  unsavedIds: new Set(),
  cursorPos: { line: 1, col: 1 },
  projectName: "Untitled Project",
  projectId: null,
  terminalLogs: [],
  selectedFolder: null,
  selectedFiles: new Set(),
  clipboard: null,
  searchQuery: "",
  sortBy: "name",
  sortOrder: "asc",
  expandedFolders: new Set(),

  setSelectedFolder: (folder) => set({ selectedFolder: folder }),
  setFiles: (files, projectId) =>
    set({
      files,
      projectId,
      activeFile: files.find((f) => !f.isFolder) ?? null,
      openTabs: files.filter((f) => !f.isFolder).slice(0, 1),
      unsavedIds: new Set(),
    }),

  openFile: (file) => {
    if (file.isFolder) return;
    const { openTabs } = get();
    const exists = openTabs.find((f) => f.id === file.id);
    if (!exists) set({ openTabs: [...openTabs, file], activeFile: file });
    else set({ activeFile: file });
  },

  closeFile: (id) => {
    const { openTabs, activeFile, unsavedIds } = get();
    const newTabs = openTabs.filter((f) => f.id !== id);
    let newActive = activeFile;
    if (activeFile?.id === id) {
      const idx = openTabs.findIndex((f) => f.id === id);
      newActive = newTabs[idx] ?? newTabs[idx - 1] ?? null;
    }
    const nu = new Set(unsavedIds);
    nu.delete(id);
    set({ openTabs: newTabs, activeFile: newActive, unsavedIds: nu });
  },

  setActiveFile: (file) => set({ activeFile: file }),

  createFile: async (name, path) => {
    const { selectedFolder, projectId } = get();

    if (!projectId) return;

    const finalPath = path !== undefined
      ? path
      : selectedFolder
      ? selectedFolder.path + "/" + name
      : "/" + name;

    try {
      const res = await fetch("/api/file/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name,
          path: finalPath,
          isFolder: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to create file");

      const newFile = await res.json();

      set((s) => ({
        files: [...s.files, newFile],
        openTabs: [...s.openTabs, newFile],
        activeFile: newFile,
      }));
    } catch (error) {
      console.error("Error creating file:", error);
    }
  },

  createFolder: async (name, path) => {
    const { selectedFolder, projectId } = get();

    if (!projectId) return;

    const finalPath = path !== undefined
      ? path
      : selectedFolder
      ? selectedFolder.path + "/" + name
      : "/" + name;

    try {
      const res = await fetch("/api/file/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name,
          path: finalPath,
          isFolder: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to create folder");

      const newFolder = await res.json();

      set((s) => ({
        files: [...s.files, newFolder],
      }));
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  },

  updateFileContent: (id, content) =>
    set((s) => {
      const nu = new Set(s.unsavedIds);
      nu.add(id);
      const upd = (arr: IFile[]) => arr.map((f) => (f.id === id ? { ...f, content } : f));
      return {
        unsavedIds: nu,
        files: upd(s.files),
        openTabs: upd(s.openTabs),
        activeFile: s.activeFile?.id === id ? { ...s.activeFile, content } : s.activeFile,
      };
    }),

  markSaved: (id) =>
    set((s) => {
      const nu = new Set(s.unsavedIds);
      nu.delete(id);
      return { unsavedIds: nu };
    }),

  renameFile: async (id, newName) => {
    try {
      const res = await fetch("/api/file/move", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id, newName }),
      });

      if (!res.ok) throw new Error("Failed to rename file");

      set((s) => {
        const upd = (arr: IFile[]) =>
          arr.map((f) => {
            if (f.id !== id) return f;
            const parts = f.path.split("/");
            parts[parts.length - 1] = newName;
            return { ...f, name: newName, path: parts.join("/") };
          });
        return {
          files: upd(s.files),
          openTabs: upd(s.openTabs),
          activeFile: s.activeFile?.id === id
            ? { ...s.activeFile, name: newName }
            : s.activeFile,
        };
      });
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  },

  deleteFile: async (id) => {
    try {
      const res = await fetch("/api/file/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id }),
      });

      if (!res.ok) throw new Error("Failed to delete file");

      const { openTabs, activeFile } = get();
      const newTabs = openTabs.filter((f) => f.id !== id);
      const newActive = activeFile?.id === id
        ? newTabs[newTabs.length - 1] ?? null
        : activeFile;
      set((s) => ({
        files: s.files.filter((f) => f.id !== id),
        openTabs: newTabs,
        activeFile: newActive,
      }));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  },

  duplicateFile: (id) =>
    set((s) => {
      const orig = s.files.find((f) => f.id === id);
      if (!orig) return {};
      const copy: IFile = {
        ...orig,
        id: crypto.randomUUID(),
        name: "copy_" + orig.name,
        path: orig.path.replace(orig.name, "copy_" + orig.name),
      };
      return {
        files: [...s.files, copy],
        openTabs: [...s.openTabs, copy],
        activeFile: copy,
      };
    }),

  moveFile: async (id, newPath) => {
    try {
      const res = await fetch("/api/file/move", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id, newPath }),
      });

      if (!res.ok) throw new Error("Failed to move file");

      set((s) => {
        const upd = (arr: IFile[]) =>
          arr.map((f) => {
            if (f.id !== id) return f;
            const name = f.path.split("/").pop() || f.name;
            const newFullPath = newPath + "/" + name;
            return { ...f, path: newFullPath };
          });
        return {
          files: upd(s.files),
          openTabs: upd(s.openTabs),
          activeFile: s.activeFile?.id === id
            ? { ...s.activeFile, path: newPath + "/" + (s.activeFile.path.split("/").pop() || s.activeFile.name) }
            : s.activeFile,
        };
      });
    } catch (error) {
      console.error("Error moving file:", error);
    }
  },

  copyFiles: (ids) => {
    const { files } = get();
    const filesToCopy = files.filter(f => ids.includes(f.id));
    set({ clipboard: { type: 'copy', files: filesToCopy } });
  },

  cutFiles: (ids) => {
    const { files } = get();
    const filesToCut = files.filter(f => ids.includes(f.id));
    set({ clipboard: { type: 'cut', files: filesToCut } });
  },

  pasteFiles: (targetPath) =>
    set((s) => {
      if (!s.clipboard) return {};

      const newFiles = s.clipboard.files.map(f => ({
        ...f,
        id: crypto.randomUUID(),
        path: targetPath + "/" + f.name,
      }));

      const remainingFiles = s.clipboard.type === 'cut'
        ? s.files.filter(f => !s.clipboard!.files.some(cf => cf.id === f.id))
        : s.files;

      return {
        files: [...remainingFiles, ...newFiles],
        clipboard: s.clipboard.type === 'cut' ? null : s.clipboard,
      };
    }),

  setSelectedFiles: (ids, additive = false) =>
    set((s) => ({
      selectedFiles: additive ? new Set([...s.selectedFiles, ...ids]) : new Set(ids),
    })),

  toggleFileSelection: (id) =>
    set((s) => {
      const newSelected = new Set(s.selectedFiles);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedFiles: newSelected };
    }),

  clearSelection: () => set({ selectedFiles: new Set() }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortBy: (sort) => set({ sortBy: sort }),

  setSortOrder: (order) => set({ sortOrder: order }),

  toggleFolderExpansion: (path) =>
    set((s) => {
      const newExpanded = new Set(s.expandedFolders);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      return { expandedFolders: newExpanded };
    }),

  expandAllFolders: () =>
    set((s) => ({
      expandedFolders: new Set(s.files.filter(f => f.isFolder).map(f => f.path)),
    })),

  collapseAllFolders: () => set({ expandedFolders: new Set() }),

  setCursorPos: (line, col) => set({ cursorPos: { line, col } }),
  setProjectName: (name) => set({ projectName: name }),
  addLog: (type, msg) =>
    set((s) => ({ terminalLogs: [...s.terminalLogs, { type, msg, ts: Date.now() }] })),
  clearLogs: () => set({ terminalLogs: [] }),
}));