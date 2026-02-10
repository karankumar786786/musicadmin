import { client } from "@/lib/supabase";
import UpdateSongForm from "./update-song-form";

export const dynamic = "force-dynamic";

export default async function EditSongPage({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const { songId } = await params;

  const { data: song, error } = await client
    .from("songs")
    .select("*")
    .eq("id", songId)
    .single();

  if (error || !song) {
    return <div className="p-4 text-red-500">Error: Song not found</div>;
  }

  return (
    <div className="p-4">
      <UpdateSongForm song={song} />
    </div>
  );
}
