import PlaygroundClient from "./PlaygroundClient";

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const host = "http://localhost:3000"; // temporary

  const res = await fetch(`${host}/api/file/${id}`, {
    cache: "no-store",
  });

  const files = await res.json();

  return <PlaygroundClient files={files} projectId={id} />;
}