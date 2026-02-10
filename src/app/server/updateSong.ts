"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { client } from "@/lib/supabase";
import { uploadToS3 } from "@/lib/s3Util";

export async function updateSong(prevState: any, formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const songId = formData.get('songId') as string;
    const title = formData.get('title') as string;
    const album = formData.get('album') as string;
    const artist = formData.get('artist') as string;
    const language = formData.get('language') as string;
    const duration = parseInt(formData.get('duration') as string) || 0;

    const songFile = formData.get('song') as File;
    const coverFile = formData.get('coverImage') as File;

    let songUrl = null;
    let coverUrl = null;

    try {
        if (songFile && songFile.size > 0) {
            const songBuffer = Buffer.from(await songFile.arrayBuffer());
            const songKey = `songs-${userId}-${Date.now()}-${songFile.name}`;
            songUrl = await uploadToS3(songBuffer, songKey, songFile.type);
        }

        if (coverFile && coverFile.size > 0) {
            const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
            const coverKey = `covers-${userId}-${Date.now()}-${coverFile.name}`;
            coverUrl = await uploadToS3(coverBuffer, coverKey, coverFile.type);
        }

        const updates: any = {
            title,
            album,
            language,
            duration,
            artist_stage_name: artist,
        };

        if (songUrl) updates.songUrl = songUrl;
        if (coverUrl) updates.coverImageUrl = coverUrl;

        const { error } = await client
            .from('songs')
            .update(updates)
            .eq('id', songId);

        if (error) {
            console.error("Supabase Update Error:", error);
            throw new Error(`Failed to update song: ${error.message}`);
        }

        revalidatePath('/listsongs');
        revalidatePath(`/song/${songId}`);
        return { success: true, error: "" };
    } catch (error: any) {
        console.error("Update Song Error:", error);
        return { success: false, error: error.message || "Failed to update song" };
    }
}
