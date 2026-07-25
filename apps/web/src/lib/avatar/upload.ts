"use client";

import type { Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { blobToDataUrl, buildAvatarThumbnails } from "./crop-image";
import { AVATAR_BUCKET, AVATAR_THUMB_SIZES, type AvatarThumbSize } from "./sizes";

export type AvatarUploadResult = {
  /** Preferred display URL (96px thumb) */
  avatarUrl: string;
  thumbs: Partial<Record<AvatarThumbSize, string>>;
  storage: "supabase" | "demo";
};

export async function uploadProfileAvatars(input: {
  userId: string;
  imageSrc: string;
  crop: Area;
}): Promise<AvatarUploadResult> {
  const thumbs = await buildAvatarThumbnails(input.imageSrc, input.crop);

  // Extra pass through browser-image-compression for the largest thumb only
  // (smaller sizes are already tiny after canvas encode).
  const largestFile = new File([thumbs[256]], "avatar-256.webp", {
    type: "image/webp",
  });
  thumbs[256] = await imageCompression(largestFile, {
    maxSizeMB: 0.12,
    maxWidthOrHeight: 256,
    useWebWorker: true,
    fileType: "image/webp",
  });

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const urls: Partial<Record<AvatarThumbSize, string>> = {};
      for (const size of AVATAR_THUMB_SIZES) {
        const path = `${input.userId}/avatar-${size}.webp`;
        const { error } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(path, thumbs[size], {
            upsert: true,
            contentType: "image/webp",
            cacheControl: "3600",
          });
        if (error) throw error;
        const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
        urls[size] = `${data.publicUrl}?v=${Date.now()}`;
      }
      return {
        avatarUrl: urls[96] ?? urls[256] ?? "",
        thumbs: urls,
        storage: "supabase",
      };
    }
  }

  // Demo mode: persist optimized data URLs locally (96px as primary)
  const demoUrls: Partial<Record<AvatarThumbSize, string>> = {};
  for (const size of AVATAR_THUMB_SIZES) {
    demoUrls[size] = await blobToDataUrl(thumbs[size]);
  }
  return {
    avatarUrl: demoUrls[96] ?? demoUrls[48] ?? "",
    thumbs: demoUrls,
    storage: "demo",
  };
}
