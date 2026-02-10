"use server";

import { client } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function deleteSystemPlaylist(playlistId: number) {
    try {
        const { error } = await client.from("system_playlist").delete().eq("id", playlistId);

        if (error) {
            console.error("Error deleting system playlist:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/listsystemplaylists");
        return { success: true };
    } catch (error) {
        console.error("Unexpected error deleting system playlist:", error);
        return { success: false, error: "Unexpected error occurred" };
    }
}
