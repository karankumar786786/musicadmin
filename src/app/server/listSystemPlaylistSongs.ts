"use server";

import { client } from "@/lib/supabase";

export async function listSystemPlaylistSongs(playlistId: number) {
    try {
        const { data, error } = await client
            .from("system_playlist_songs")
            .select("id, songId, songs(id, title, album, coverImageUrl, artist_stage_name, duration)")
            .eq("playlistId", playlistId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error listing system playlist songs:", error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error("Unexpected error listing system playlist songs:", error);
        return [];
    }
}
