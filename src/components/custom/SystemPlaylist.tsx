"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteSystemPlaylist } from "@/app/server/deleteSystemPlaylist";
import { useState } from "react";
import {useRouter} from "next/navigation"

function SystemPlaylist({
  playlistName,
  playlistId,
  playlistImageUrl,
}: {
  playlistName: string;
  playlistId: number;
  playlistImageUrl: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this system playlist?")) {
      setIsDeleting(true);
      const res = await deleteSystemPlaylist(playlistId);
      if (!res.success) {
        alert("Failed to delete system playlist: " + res.error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div onClick={()=>{router.push(`/systemplaylistsongs/${playlistId}`)}} className="bg-pink-600 w-full flex gap-10 m-1 items-center justify-between p-4 rounded-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={playlistImageUrl}
        alt={playlistName}
        width={100}
        height={100}
        className="object-cover rounded-md h-24 w-24"
      />
      <div className="text-white text-2xl">{playlistName}</div>
      <div className="text-gray-200 text-sm">ID: {playlistId}</div>
      <div className="flex gap-2">
        <Link href={`/systemplaylist/${playlistId}`}>
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

export default SystemPlaylist;
