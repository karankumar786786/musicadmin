"use server";

import { client } from "@/lib/supabase";

export async function listArtists() {
    try {
        const { data, error } = await client
            .from("artists")
            .select("id, stage_name, real_name, profileImageUrl")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error listing artists:", error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error("Unexpected error listing artists:", error);
        return [];
    }
}
