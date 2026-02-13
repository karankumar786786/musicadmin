"use server";

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { client } from "@/lib/supabase";
import { uploadToS3, deleteFromS3 } from "@/lib/s3Util";
import { randomUUID } from 'crypto';

export async function createSong(prevState: any, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const songFile = formData.get('song') as File;
  const coverFile = formData.get('coverImage') as File;
  const title = formData.get('title') as string;
  const album = formData.get('album') as string;

  const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
  const songBuffer = Buffer.from(await songFile.arrayBuffer());

  // Generate unique song ID for predictable S3 key
  const songId = randomUUID();
  const timestamp = Date.now();

  // Create a clean song slug from title
  const songSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // S3 key pattern: {processingId}-{slug}.ext (simpler, no userId in path)
  const songKey = `${songId}-${songSlug}.${songFile.name.split('.').pop()}`;
  const coverKey = `${timestamp}-${coverFile.name}`;

  let coverUploaded = false;

  try {
    // Upload cover image first
    const coverUrl = await uploadToS3(coverBuffer, coverKey, coverFile.type);
    coverUploaded = true;

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

    // Upload audio file to S3 temp bucket (will trigger SQS)
    // The S3 key is just: {processingId}-{slug}.mp3
    await uploadToS3(songBuffer, songKey, songFile.type);

    console.log("Audio uploaded to S3 for processing:", songKey);

    revalidatePath('/dashboard');
    return {
      success: true,
      error: "",
      songId: songId
    };

  } catch (error: any) {
    console.error("Create Song Error:", error);

    // Perform cleanup if cover was uploaded but operation failed
    if (coverUploaded) {
      console.log("Cleaning up cover image from S3 due to failure...");
      await deleteFromS3(coverKey);
    }

    return {
      success: false,
      error: error.message || "Failed to create song"
    };
  }
}