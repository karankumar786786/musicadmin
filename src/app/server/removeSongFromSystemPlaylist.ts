"use server";

import { client } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function removeSongFromSystemPlaylist(entryId: number, playlistId: number) {
    try {
        const { error } = await client
            .from("system_playlist_songs")
            .delete()
            .eq("id", entryId);

        if (error) {
            console.error("Error removing song from system playlist:", error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/systemplaylist/${playlistId}`);
        return { success: true };
    } catch (error) {
        console.error("Unexpected error removing song from system playlist:", error);
        return { success: false, error: "Unexpected error occurred" };
    }
}
