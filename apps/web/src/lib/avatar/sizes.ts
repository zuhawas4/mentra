/** Required avatar thumbnail sizes (px). Only these are generated/stored. */
export const AVATAR_THUMB_SIZES = [48, 96, 256] as const;

export type AvatarThumbSize = (typeof AVATAR_THUMB_SIZES)[number];

export const AVATAR_BUCKET = "avatars";
export const AVATAR_OUTPUT_TYPE = "image/webp";
export const AVATAR_OUTPUT_QUALITY = 0.82;
