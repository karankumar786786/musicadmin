"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteSong } from "@/app/server/deleteSong";
import { useState } from "react";

function Song({
  songName,
  songId,
  SongCoverImageUrl,
}: {
  songName: string;
  songId: string;
  SongCoverImageUrl: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this song?")) {
      setIsDeleting(true);
      const res = await deleteSong(songId);
      if (!res.success) {
        alert("Failed to delete song: " + res.error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-green-600 w-full flex gap-10 m-1 items-center justify-between p-4 rounded-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SongCoverImageUrl} alt={songName} width={120} height={40} />
      <div className="text-yellow-500 text-2xl">{songName}</div>
      <div className="text-purple-900">{songId}</div>
      <div className="flex gap-2">
        <Link href={`/song/${songId}`}>
          <Button variant="outline">Edit</Button>
        </Link>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}

export default Song;
