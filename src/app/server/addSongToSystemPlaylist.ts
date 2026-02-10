"use server";

import { client } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addSongToSystemPlaylist(songId: number, playlistId: number) {
    try {
        // Check if song is already in the playlist
        const { data: existing } = await client
            .from("system_playlist_songs")
            .select("id")
            .eq("songId", songId)
            .eq("playlistId", playlistId)
            .single();

        if (existing) {
            return { success: false, error: "Song is already in this playlist" };
        }

        const { error } = await client
            .from("system_playlist_songs")
            .insert({ songId, playlistId });

        if (error) {
            console.error("Error adding song to system playlist:", error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/systemplaylist/${playlistId}`);
        return { success: true };
    } catch (error) {
        console.error("Unexpected error adding song to system playlist:", error);
        return { success: false, error: "Unexpected error occurred" };
    }
}
