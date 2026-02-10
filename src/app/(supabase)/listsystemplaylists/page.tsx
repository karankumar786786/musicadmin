import SystemPlaylist from "@/components/custom/SystemPlaylist";
import { listSystemPlaylists } from "@/app/server/listSystemPlaylists";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export const dynamic = "force-dynamic";

async function Page() {
  const playlists = await listSystemPlaylists();

  return (
    <main className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">System Playlists</h1>
        <Link href="/createsystemplaylist">
          <Button>Create New Playlist</Button>
        </Link>
      </div>

      {playlists && playlists.length > 0 ? (
        playlists.map((playlist: any) => (
          <SystemPlaylist
            key={playlist.id}
            playlistName={playlist.playlistName}
            playlistId={playlist.id}
            playlistImageUrl={playlist.playlistCoverImageUrl}
          />
        ))
      ) : (
        <div className="text-gray-500">No system playlists found.</div>
      )}
    </main>
  );
}

export default Page;
