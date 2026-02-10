"use client";

import { Button } from "@/components/ui/button";
import { addSongToSystemPlaylist } from "@/app/server/addSongToSystemPlaylist";
import { useState } from "react";

export default function AddSongToPlaylist({
  playlistId,
  songs,
  existingSongIds,
}: {
  playlistId: number;
  songs: any[];
  existingSongIds: number[];
}) {
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const handleAdd = async (songId: number) => {
    setAddingId(songId);
    const res = await addSongToSystemPlaylist(songId, playlistId);
    if (res.success) {
      setAddedIds((prev) => [...prev, songId]);
    } else {
      alert("Failed to add song: " + res.error);
    }
    setAddingId(null);
  };

  const availableSongs = songs.filter(
    (song) => !existingSongIds.includes(song.id) && !addedIds.includes(song.id),
  );

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold mb-4">Add Songs to Playlist</h2>
      {availableSongs.length === 0 ? (
        <div className="text-gray-500">
          All songs are already in this playlist.
        </div>
      ) : (
        availableSongs.map((song: any) => (
          <div
            key={song.id}
            className="bg-zinc-800 w-full flex gap-6 items-center justify-between p-3 rounded-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={song.coverImageUrl}
              alt={song.title}
              width={60}
              height={60}
              className="object-cover rounded h-14 w-14"
            />
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">
                {song.title}
              </div>
              <div className="text-gray-400 text-sm truncate">
                {song.artist_stage_name} • {song.album}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleAdd(song.id)}
              disabled={addingId === song.id}
            >
              {addingId === song.id ? "Adding..." : "Add"}
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
