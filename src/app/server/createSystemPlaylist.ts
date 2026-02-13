"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { client } from "@/lib/supabase";
import { uploadToS3, deleteFromS3 } from "@/lib/s3Util";

const initialState = {
    success: false,
    error: "",
};

export async function createSystemPlaylist(prevState: any, formData: FormData) {
    let coverUploaded = false;
    let coverKey = "";
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const playlistName = formData.get("playlistName") as string;
        const coverFile = formData.get("coverImage") as File;

        if (!playlistName || !coverFile) {
            return { success: false, error: "Missing required fields" };
        }

        // Upload cover image to S3
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
        coverKey = `system-playlists-${userId}-${Date.now()}-${coverFile.name}`;
        const coverUrl = await uploadToS3(coverBuffer, coverKey, coverFile.type);
        coverUploaded = true;

        // Insert into Supabase
        const { error } = await client.from("system_playlist").insert({
            playlistName: playlistName,
            playlistCoverImageUrl: coverUrl,
        });

        if (error) {
            console.error("Supabase System Playlist Error:", error);
            if (error.code === '23505') {
                throw new Error("A playlist with this name already exists.");
            }
            throw new Error(error.message);
        }

        revalidatePath("/listsystemplaylists");
        return { success: true, error: "" };
    } catch (error: any) {
        console.error("Create System Playlist Error:", error);

        if (coverUploaded) {
            console.log("Cleaning up playlist cover image from S3 due to failure...");
            await deleteFromS3(coverKey);
        }

        return { success: false, error: error.message || "Failed to create playlist" };
    }
}
