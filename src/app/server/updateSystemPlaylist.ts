"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { client } from "@/lib/supabase";
import { uploadToS3 } from "@/lib/s3Util";

export async function updateSystemPlaylist(prevState: any, formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const playlistId = formData.get('playlistId') as string;
    const playlistName = formData.get('playlistName') as string;
    const coverFile = formData.get('coverImage') as File;

    let coverUrl = null;

    try {
        if (coverFile && coverFile.size > 0) {
            const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
            const coverKey = `system-playlists-${userId}-${Date.now()}-${coverFile.name}`;
            coverUrl = await uploadToS3(coverBuffer, coverKey, coverFile.type);
        }

        const updates: any = {
            playlistName,
        };

        if (coverUrl) updates.playlistCoverImageUrl = coverUrl;

        const { error } = await client
            .from('system_playlist')
            .update(updates)
            .eq('id', playlistId);

        if (error) {
            console.error("Supabase Update Error:", error);
            throw new Error(`Failed to update system playlist: ${error.message}`);
        }

        revalidatePath('/listsystemplaylists');
        revalidatePath(`/systemplaylist/${playlistId}`);
        return { success: true, error: "" };
    } catch (error: any) {
        console.error("Update System Playlist Error:", error);
        return { success: false, error: error.message || "Failed to update system playlist" };
    }
}
