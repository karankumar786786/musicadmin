"use server";

import { auth } from "@clerk/nextjs/server";
import { getSignedUploadUrl } from "@/lib/s3Util";
import { randomUUID } from "crypto";

export async function getPresignedUrl(
    fileType: string,
    fileName: string,
    folder: "songs" | "covers" | "artists"
) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        // Sanitize filename
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "");

        // Generate key based on folder type
        let key = "";
        const timestamp = Date.now();
        const id = randomUUID();

        if (folder === "songs") {
            // Match existing pattern: {processingId}-{slug}.ext
            // We'll use the ID as the processingId
            key = `${id}-${cleanFileName}`;
        } else if (folder === "covers") {
            key = `${timestamp}-${cleanFileName}`;
        } else if (folder === "artists") {
            key = `artists-${userId}-${timestamp}-${cleanFileName}`;
        }

        const { uploadUrl, publicUrl } = await getSignedUploadUrl(key, fileType);

        return {
            success: true,
            uploadUrl,
            publicUrl,
            key,
            fileId: id // Return ID so client can use it if needed/generated
        };

    } catch (error: any) {
        console.error("Presigned URL Generation Error:", error);
        return { success: false, error: error.message };
    }
}
