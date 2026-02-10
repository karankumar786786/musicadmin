import Artist from "@/components/custom/Artist";
import { listArtists } from "@/app/server/listArtists";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export const dynamic = "force-dynamic";

async function Page() {
  const artists = await listArtists();

  return (
    <>
    <div className="bg-amber-500 h-10 flex space-x-34">
        <div>Artist List</div>
        <Button  className="">
          <Link href="/createartist">Add Artist</Link>
        </Button>
      </div>
      <main className="p-4 flex flex-col gap-4">
      {artists && artists.length > 0 ? (
        artists.map((artist: any) => (
          <Artist
            key={artist.id}
            artistName={artist.stage_name}
            artistId={artist.id}
            artistImageUrl={artist.profileImageUrl}
          />
        ))
      ) : (
        <div className="text-gray-500">No artists found.</div>
      )}
    </main>
    </>
  );
}

export default Page;
