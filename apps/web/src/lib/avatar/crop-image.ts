import type { Area } from "react-easy-crop";
import {
  AVATAR_OUTPUT_QUALITY,
  AVATAR_OUTPUT_TYPE,
  AVATAR_THUMB_SIZES,
  type AvatarThumbSize,
} from "./sizes";

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = src;
  });
  return image;
}

export async function getCroppedBlob(
  imageSrc: string,
  crop: Area,
  size: number,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, AVATAR_OUTPUT_TYPE, AVATAR_OUTPUT_QUALITY),
  );
  if (!blob) throw new Error("Failed to encode avatar");
  return blob;
}

export async function buildAvatarThumbnails(
  imageSrc: string,
  crop: Area,
): Promise<Record<AvatarThumbSize, Blob>> {
  const out = {} as Record<AvatarThumbSize, Blob>;
  for (const size of AVATAR_THUMB_SIZES) {
    out[size] = await getCroppedBlob(imageSrc, crop, size);
  }
  return out;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}
