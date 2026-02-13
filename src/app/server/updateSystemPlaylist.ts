"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { client } from "@/lib/supabase";
import { uploadToS3, deleteFromS3 } from "@/lib/s3Util";

export async function updateSystemPlaylist(prevState: any, formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const playlistId = formData.get('playlistId') as string;
    const playlistName = formData.get('playlistName') as string;
    const coverFile = formData.get('coverImage') as File;

    let coverUrl = null;
    let coverKey = "";
    let coverUploaded = false;

    try {
        if (coverFile && coverFile.size > 0) {
            const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
            coverKey = `system-playlists-${userId}-${Date.now()}-${coverFile.name}`;
            coverUrl = await uploadToS3(coverBuffer, coverKey, coverFile.type);
            coverUploaded = true;
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
            if (error.code === '23505') {
                throw new Error("A playlist with this name already exists.");
            }
            throw new Error(`Failed to update system playlist: ${error.message}`);
        }

        revalidatePath('/listsystemplaylists');
        revalidatePath(`/systemplaylist/${playlistId}`);
        return { success: true, error: "" };
    } catch (error: any) {
        console.error("Update System Playlist Error:", error);

        if (coverUploaded) {
            console.log("Cleaning up updated playlist cover image from S3 due to failure...");
            await deleteFromS3(coverKey);
        }

        return { success: false, error: error.message || "Failed to update system playlist" };
    }
}
