export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/file/${id}`);
  const files = await res.json();

  return (
    <div className="p-6 text-white">
      <h1 className="mb-6">Project: {id}</h1>

      <pre className="text-xs">
        {JSON.stringify(files, null, 2)}
      </pre>
    </div>
  );
}