import { client } from "@/lib/supabase";
import UpdateArtistForm from "./update-artist-form";

export const dynamic = "force-dynamic";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ artistId: string }>;
}) {
  const { artistId } = await params;

  const { data: artist, error } = await client
    .from("artists")
    .select("*")
    .eq("id", artistId)
    .single();

  if (error || !artist) {
    return <div className="p-4 text-red-500">Error: Artist not found</div>;
  }

  return (
    <div className="p-4">
      <UpdateArtistForm artist={artist} />
    </div>
  );
}
