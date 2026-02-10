"use client";

import { Button } from "@/components/ui/button";
import { removeSongFromSystemPlaylist } from "@/app/server/removeSongFromSystemPlaylist";
import { useState } from "react";

export default function SystemPlaylistSongItem({
  entryId,
  playlistId,
  song,
}: {
  entryId: number;
  playlistId: number;
  song: any;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (confirm(`Remove "${song.title}" from this playlist?`)) {
      setIsRemoving(true);
      const res = await removeSongFromSystemPlaylist(entryId, playlistId);
      if (!res.success) {
        alert("Failed to remove song: " + res.error);
        setIsRemoving(false);
      }
    }
  };

  return (
    <div className="bg-zinc-800 w-full flex gap-6 items-center justify-between p-3 rounded-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={song.coverImageUrl}
        alt={song.title}
        width={60}
        height={60}
        className="object-cover rounded h-14 w-14"
      />
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate">{song.title}</div>
        <div className="text-gray-400 text-sm truncate">
          {song.artist_stage_name} • {song.album}
        </div>
      </div>
      <div className="text-gray-400 text-sm">
        {Math.floor(song.duration / 60)}:
        {String(song.duration % 60).padStart(2, "0")}
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        {isRemoving ? "Removing..." : "Remove"}
      </Button>
    </div>
  );
}
