"use server";
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { client } from "@/lib/supabase";
import { uploadToS3 } from "@/lib/s3Util";
import { randomUUID } from 'crypto';




export async function createSong(prevState: any, formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const songFile = formData.get('song') as File;
    const coverFile = formData.get('coverImage') as File;
    const title = formData.get('title') as string;
    const album = formData.get('album') as string;
    const songBuffer = Buffer.from(await songFile.arrayBuffer());
    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

    const songKey = `songs-${userId}-${Date.now()}-${songFile.name}`;
    const coverKey = `covers-${userId}-${Date.now()}-${coverFile.name}`;

    try {
        const [songUrl, coverUrl] = await Promise.all([
            uploadToS3(songBuffer, songKey, songFile.type),
            uploadToS3(coverBuffer, coverKey, coverFile.type)
        ]);
        console.log("here");
        const { error } = await client.from('songs').insert({
            title,
            album,
            coverImageUrl: coverUrl,
            songUrl: songUrl,
            language: formData.get('language') as string,
            duration: parseInt(formData.get('duration') as string) || 0,
            artist_stage_name: formData.get('artist') as string,
        });

        if (error) {
            console.error("Supabase Error:", error);
            throw new Error(`Failed to save song metadata: ${error.message}`);
        }

        revalidatePath('/dashboard');
        return { success: true, error: "" };
    } catch (error) {
        console.error("Create Song Error:", error);
        return { success: false, error: "Failed to create song" };
    }
}