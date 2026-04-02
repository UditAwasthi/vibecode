"use client";

import { useEffect } from "react";
import { useFileStore } from "@/store/file.store";
import FileTree from "@/components/FileTree";
import Editor from "@/components/Editor";
export default function PlaygroundClient({ files }: { files: any[] }) {
  const { setFiles } = useFileStore();

  useEffect(() => {
    setFiles(files);
  }, [files, setFiles]);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* LEFT */}
      <FileTree />

      {/* RIGHT */}
      <Editor />
    </div>
  );
}