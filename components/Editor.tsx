"use client";

import { useFileStore } from "@/store/file.store";

export default function Editor() {
  const { activeFile } = useFileStore();

  if (!activeFile) {
    return <div className="flex-1 p-6">No file selected</div>;
  }

  return (
    <div className="flex-1 p-6">
      <h2 className="mb-4 text-sm text-muted-foreground">
        {activeFile.name}
      </h2>

      <textarea
        value={activeFile.content || ""}
        readOnly
        className="w-full h-full bg-transparent outline-none text-sm font-mono"
      />
    </div>
  );
}