"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteArtist } from "@/app/server/deleteArtist";
import { useState } from "react";

function Artist({
  artistName,
  artistId,
  artistImageUrl,
}: {
  artistName: string;
  artistId: string;
  artistImageUrl: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this artist? This might fail if they have songs.",
      )
    ) {
      setIsDeleting(true);
      const res = await deleteArtist(artistId);
      if (!res.success) {
        alert("Failed to delete artist: " + res.error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-blue-600 w-full flex gap-10 m-1 items-center justify-between p-4 rounded-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={artistImageUrl}
        alt={artistName}
        width={100}
        height={100}
        className="object-cover rounded-full h-24 w-24"
      />
      <div className="text-white text-2xl">{artistName}</div>
      <div className="text-gray-300 text-sm">{artistId}</div>
      <div className="flex gap-2">
        <Link href={`/artist/${artistId}`}>
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

export default Artist;
