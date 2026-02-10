"use server"
import { client } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function listSong() {
    try {
        const { data, error } = await client
            .from('songs')
            .select(`
                id,
                title,
                album,
                coverImageUrl,
                songUrl,
                artist_stage_name
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase List Songs Error:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("List Songs Error:", error);
        return [];
    }
}