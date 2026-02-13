import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { uploadToS3, deleteFromS3 } from "@/lib/s3Util";
import { client } from "@/lib/supabase";

export async function createArtist(prevState: any, formData: FormData) {
    let coverUploaded = false;
    let coverKey = "";
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const coverFile = formData.get('coverImage') as File;
        const stageName = formData.get('stageName') as string;
        const realName = formData.get('realName') as string;
        const bio = formData.get('bio') as String;

        // Upload cover image to S3
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
        coverKey = `artists-${userId}-${Date.now()}-${coverFile.name}`;
        const coverUrl = await uploadToS3(coverBuffer, coverKey, coverFile.type);
        coverUploaded = true;

        // Insert into Supabase
        const { error } = await client.from('artists').insert({
            stage_name: stageName,
            real_name: realName,
            profileImageUrl: coverUrl,
            bio: bio
        });

        if (error) {
            console.error("Supabase Artist Error:", error);
            if (error.code === '23505') {
                throw new Error("An artist with this stage name already exists.");
            }
            throw new Error(error.message);
        }

        revalidatePath('/dashboard');
        return { success: true, error: "" };
    } catch (error: any) {
        console.error("Create Artist Error:", error);

        if (coverUploaded) {
            console.log("Cleaning up artist cover image from S3 due to failure...");
            await deleteFromS3(coverKey);
        }

        return { success: false, error: error.message || "Failed to create artist" };
    }
}