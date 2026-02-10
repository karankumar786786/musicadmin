import { client } from "@/lib/supabase";
import { listSystemPlaylistSongs } from "@/app/server/listSystemPlaylistSongs";
import UpdateSystemPlaylistForm from "./update-system-playlist-form";
import SystemPlaylistSongItem from "@/components/custom/SystemPlaylistSongItem";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EditSystemPlaylistPage({
  params,
}: {
  params: Promise<{ playlistId: string }>;
}) {
  const { playlistId } = await params;
  const numericId = parseInt(playlistId);

  const { data: playlist, error } = await client
    .from("system_playlist")
    .select("*")
    .eq("id", numericId)
    .single();

  if (error || !playlist) {
    return (
      <div className="p-4 text-red-500">Error: System Playlist not found</div>
    );
  }

  const playlistSongs = await listSystemPlaylistSongs(numericId);

  return (
    <div className="p-4 space-y-8">
      <UpdateSystemPlaylistForm playlist={playlist} />

      {/* Songs in this playlist */}
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            Songs in Playlist ({playlistSongs.length})
          </h2>
          <Link href={`/systemplaylistsongs/${playlistId}/addsong`}>
            <Button>Add Song</Button>
          </Link>
        </div>

        <div className="space-y-2">
          {playlistSongs.length > 0 ? (
            playlistSongs.map((entry: any) => (
              <SystemPlaylistSongItem
                key={entry.id}
                entryId={entry.id}
                playlistId={numericId}
                song={entry.songs}
              />
            ))
          ) : (
            <div className="text-gray-500">
              No songs in this playlist yet. Click &quot;Add Song&quot; to get
              started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
