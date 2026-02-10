import { client } from "@/lib/supabase";
import { listSystemPlaylistSongs } from "@/app/server/listSystemPlaylistSongs";
import { listSong } from "@/app/server/listSongs";
import AddSongToPlaylist from "@/components/custom/AddSongToPlaylist";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AddSongToPlaylistPage({
  params,
}: {
  params: Promise<{ playlistId: string }>;
}) {
  const { playlistId } = await params;
  const numericId = parseInt(playlistId);

  const { data: playlist } = await client
    .from("system_playlist")
    .select("id, playlistName")
    .eq("id", numericId)
    .single();

  if (!playlist) {
    return <div className="p-4 text-red-500">Playlist not found</div>;
  }

  const playlistSongs = await listSystemPlaylistSongs(numericId);
  const existingSongIds = playlistSongs.map((entry: any) => entry.songId);

  const allSongs = await listSong();

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/systemplaylistsongs/${playlistId}`}>
          <Button variant="outline">← Back</Button>
        </Link>
        <h1 className="text-2xl font-bold">
          Add Songs to &quot;{playlist.playlistName}&quot;
        </h1>
      </div>
      <AddSongToPlaylist
        playlistId={numericId}
        songs={allSongs}
        existingSongIds={existingSongIds}
      />
    </div>
  );
}
