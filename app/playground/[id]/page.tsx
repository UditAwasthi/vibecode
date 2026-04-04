import 'dotenv/config';
import PlaygroundClient from "./PlaygroundClient";

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const host = process.env.NEXT_PUBLIC_VERCEL_URL; 

  const res = await fetch(`${host}/api/file/${id}`, {
    cache: "no-store",
  });

  const files = await res.json();

  return <PlaygroundClient files={files} projectId={id} />;
}