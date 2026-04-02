import { create } from "zustand";

type File = {
  id: string;
  name: string;
  path: string;
  content: string | null;
};

type FileStore = {
  files: File[];
  activeFile: File | null;

  setFiles: (files: File[]) => void;
  setActiveFile: (file: File) => void;
};

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  activeFile: null,

  setFiles: (files) =>
    set({
      files,
      activeFile: files[0] || null, // auto-select first file
    }),

  setActiveFile: (file) => set({ activeFile: file }),
}));