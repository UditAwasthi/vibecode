"use client";

import { useFileStore } from "@/store/file.store";

export default function FileTree() {
  const { files, setActiveFile } = useFileStore();

  return (
    <div className="w-64 border-r border-border p-4">
      <h2 className="mb-4 text-sm text-muted-foreground">FILES</h2>

      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => setActiveFile(file)}
          className="cursor-pointer px-2 py-1 rounded hover:bg-white/10"
        >
          {file.name}
        </div>
      ))}
    </div>
  );
}