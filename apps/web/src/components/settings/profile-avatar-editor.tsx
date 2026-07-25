"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadProfileAvatars } from "@/lib/avatar/upload";
import { AVATAR_THUMB_SIZES } from "@/lib/avatar/sizes";

export function ProfileAvatarEditor({
  userId,
  fullName,
  avatarUrl,
  onSaved,
}: {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  onSaved: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  function onPickFile(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(String(reader.result));
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setOpen(true);
    };
    reader.readAsDataURL(file);
  }

  async function saveCrop() {
    if (!imageSrc || !croppedArea) return;
    setSaving(true);
    try {
      const result = await uploadProfileAvatars({
        userId,
        imageSrc,
        crop: croppedArea,
      });
      onSaved(result.avatarUrl);
      toast.success(
        result.storage === "supabase"
          ? `Avatar saved (${AVATAR_THUMB_SIZES.join("/")}px WebP)`
          : `Avatar saved locally (${AVATAR_THUMB_SIZES.join("/")}px WebP)`,
      );
      setOpen(false);
      setImageSrc(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to save avatar.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 text-lg">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
        <AvatarFallback name={fullName} />
      </Avatar>
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--mentra-ink)]">
          Profile photo
        </p>
        <p className="text-xs text-[var(--mentra-muted)]">
          Crop once — we store only {AVATAR_THUMB_SIZES.join(", ")}px WebP
          thumbnails.
        </p>
        <div>
          <Button type="button" variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <ImagePlus className="h-4 w-4" />
              Change photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />
            </label>
          </Button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!saving) {
            setOpen(next);
            if (!next) setImageSrc(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop profile photo</DialogTitle>
          </DialogHeader>
          <div className="relative h-72 overflow-hidden rounded-2xl bg-[#111]">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--mentra-muted)]" htmlFor="zoom">
              Zoom
            </label>
            <input
              id="zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[var(--mentra-primary)]"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => {
                setOpen(false);
                setImageSrc(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveCrop} disabled={saving || !croppedArea}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save thumbnails"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
