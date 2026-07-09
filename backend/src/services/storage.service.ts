import { put } from "@vercel/blob";
import config from "../config";

export async function uploadImage(
  buffer: Buffer,
  mimetype: string,
  filename: string,
): Promise<string> {
  if (!config.blobReadWriteToken) {
    throw new Error("Vercel Blob is not configured (missing BLOB_READ_WRITE_TOKEN)");
  }

  const filePath = `posts/${Date.now()}-${filename}`;
  const blob = await put(filePath, buffer, {
    contentType: mimetype,
    access: "public",
    token: config.blobReadWriteToken,
  });

  return blob.url;
}
