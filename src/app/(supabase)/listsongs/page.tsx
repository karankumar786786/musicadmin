import Link from "next/link";
import Song from "@/components/custom/Song";
import { listSong } from "@/app/server/listSongs";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function page() {
  const songs = await listSong();

  return (
    <>
      <div className="bg-amber-500 h-10 flex space-x-34">
        <div>Song List</div>
        <Button className="">
          <Link href="/createsong">Add Song</Link>
        </Button>
      </div>
      <main className="p-4 flex flex-col gap-4">
        {songs && songs.length > 0 ? (
          songs.map((song: any) => (
            <Song
              key={song.id}
              songName={song.title}
              songId={song.id}
              SongCoverImageUrl={song.coverImageUrl}
            />
          ))
        ) : (
          <div className="text-gray-500">No songs found.</div>
        )}
      </main>
    </>
  );
}

export default page;
