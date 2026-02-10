"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { client } from "@/lib/supabase";
import { uploadToS3 } from "@/lib/s3Util";

export async function updateArtist(prevState: any, formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const artistId = formData.get('artistId') as string;
    const stageName = formData.get('stageName') as string;
    const realName = formData.get('realName') as string;
    const bio = formData.get('bio') as string;

    const coverFile = formData.get('coverImage') as File;
    let coverUrl = null;

    try {
        if (coverFile && coverFile.size > 0) {
            const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
            const coverKey = `artists-${userId}-${Date.now()}-${coverFile.name}`;
            coverUrl = await uploadToS3(coverBuffer, coverKey, coverFile.type);
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
            throw new Error(`Failed to update artist: ${error.message}`);
        }

        revalidatePath('/listartists');
        revalidatePath(`/artist/${artistId}`);
        return { success: true, error: "" };
    } catch (error: any) {
        console.error("Update Artist Error:", error);
        return { success: false, error: error.message || "Failed to update artist" };
    }
}
