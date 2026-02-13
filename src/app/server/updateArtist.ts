"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { client } from "@/lib/supabase";
import { uploadToS3, deleteFromS3 } from "@/lib/s3Util";

export async function updateArtist(prevState: any, formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const artistId = formData.get('artistId') as string;
    const stageName = formData.get('stageName') as string;
    const realName = formData.get('realName') as string;
    const bio = formData.get('bio') as string;

    const coverFile = formData.get('coverImage') as File;
    let coverUrl = null;
    let coverKey = "";
    let coverUploaded = false;

    try {
        if (coverFile && coverFile.size > 0) {
            const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
            coverKey = `artists-${userId}-${Date.now()}-${coverFile.name}`;
            coverUrl = await uploadToS3(coverBuffer, coverKey, coverFile.type);
            coverUploaded = true;
        }

        const updates: any = {
            stage_name: stageName,
            real_name: realName,
            bio: bio,
        };

        if (coverUrl) updates.profileImageUrl = coverUrl;

        const { error } = await client
            .from('artists')
            .update(updates)
            .eq('id', artistId);

        if (error) {
            console.error("Supabase Update Artist Error:", error);
            if (error.code === '23505') {
                throw new Error("An artist with this stage name already exists.");
            }
            throw new Error(`Failed to update artist: ${error.message}`);
        }

        revalidatePath('/listartists');
        revalidatePath(`/artist/${artistId}`);
        return { success: true, error: "" };
    } catch (error: any) {
        console.error("Update Artist Error:", error);

        if (coverUploaded) {
            console.log("Cleaning up updated artist cover image from S3 due to failure...");
            await deleteFromS3(coverKey);
        }

        return { success: false, error: error.message || "Failed to update artist" };
    }
}
