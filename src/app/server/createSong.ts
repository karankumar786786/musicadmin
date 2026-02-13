"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { client } from "@/lib/supabase";
import { uploadToS3, deleteFromS3 } from "@/lib/s3Util";
import { randomUUID } from 'crypto';

export async function createSong(prevState: any, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const album = formData.get('album') as string;
  const songKey = formData.get('songKey') as string;
  const coverKey = formData.get('coverKey') as string;
  const coverUrl = formData.get('coverUrl') as string;
  const songId = formData.get('songId') as string; // From client

  if (!songKey || !coverKey || !songId) {
    return { success: false, error: "Missing file keys" };
  }

  let coverUploaded = true; // Files already uploaded by client

  try {
    // Create song record in Supabase with processingId
    // The Python processor will update songUrl and processing flag after processing
    const { data: songData, error: insertError } = await client
      .from('songs')
      .insert({
        title,
        album,
        coverImageUrl: coverUrl,
        language: formData.get('language') as string,
        duration: parseInt(formData.get('duration') as string) || 0,
        artist_stage_name: formData.get('artist') as string,
        processing: true,
        processingId: songId
        // songUrl will be NULL initially, Python will update it
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase Error:", insertError);

      // Handle duplicate song title error (Postgres code 23505)
      if (insertError.code === '23505') {
        throw new Error("A song with this title already exists.");
      }

      throw new Error(`Failed to save song metadata: ${insertError.message}`);
    }

    console.log("Song record created:", songData);
    console.log("Audio already uploaded to S3 at:", songKey);

    revalidatePath('/dashboard');
    return {
      success: true,
      error: "",
      songId: songId
    };

  } catch (error: any) {
    console.error("Create Song Error:", error);

    // Perform cleanup if cover was uploaded but operation failed
    // Since client uploaded it, we should still try to clean it up
    if (coverUploaded) {
      console.log("Cleaning up cover image from S3 due to failure...");
      await deleteFromS3(coverKey);
      // Ideally also clean up songKey
      await deleteFromS3(songKey);
    }

    return {
      success: false,
      error: error.message || "Failed to create song"
    };
  }
}