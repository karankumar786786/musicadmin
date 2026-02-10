"use server";

import { client } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function deleteSong(songId: string) {
    try {
        const { error } = await client.from("songs").delete().eq("id", songId);

        if (error) {
            console.error("Error deleting song:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/listsongs");
        return { success: true };
    } catch (error) {
        console.error("Unexpected error deleting song:", error);
        return { success: false, error: "Unexpected error occurred" };
    }
}
