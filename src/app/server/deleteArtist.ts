"use server";

import { client } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function deleteArtist(artistId: string) {
    try {
        const { error } = await client.from("artists").delete().eq("id", artistId);

        if (error) {
            console.error("Error deleting artist:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/listartists");
        return { success: true };
    } catch (error) {
        console.error("Unexpected error deleting artist:", error);
        return { success: false, error: "Unexpected error occurred" };
    }
}
