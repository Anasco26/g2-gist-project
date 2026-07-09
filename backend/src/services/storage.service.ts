import { createClient, SupabaseClient } from "@supabase/supabase-js";
import config from "../config";

let supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!supabase) {
    if (!config.supabaseUrl || !config.supabaseServiceKey) {
      throw new Error("Supabase is not configured");
    }
    supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  }
  return supabase;
}

export async function uploadImage(
  buffer: Buffer,
  mimetype: string,
  filename: string,
): Promise<string> {
  const client = getClient();
  const bucket = config.supabaseBucket;
  const filePath = `posts/${Date.now()}-${filename}`;

  const { error } = await client.storage
    .from(bucket)
    .upload(filePath, buffer, { contentType: mimetype });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: publicUrl } = client.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}
