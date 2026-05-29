import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import {
  isSupabaseConfigured,
  uploadToStorage,
  getPublicUrl,
  getAvatarsBucket,
  ensurePublicBucket,
} from "@/lib/storage";

const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "File storage isn't configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env, and create a storage bucket in Supabase Storage.",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image exceeds 5MB limit" }, { status: 400 });
    }
    const ext = ALLOWED_MIME[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Invalid image type. Only PNG, JPEG and WebP are allowed." },
        { status: 400 }
      );
    }

    const bucket = getAvatarsBucket();
    const { error: bucketError } = await ensurePublicBucket(bucket, {
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: Object.keys(ALLOWED_MIME),
    });
    if (bucketError) {
      return NextResponse.json(
        { error: "Could not prepare photo storage: " + bucketError.message },
        { status: 500 }
      );
    }

    const storageKey = `${auth.userId}/avatar-${nanoid()}.${ext}`;

    const { error: uploadError } = await uploadToStorage(storageKey, file, {
      bucket,
      upsert: true,
    });
    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload image: " + uploadError.message },
        { status: 500 }
      );
    }

    const photoUrl = getPublicUrl(storageKey, bucket);

    await prisma.$transaction([
      prisma.userProfile.upsert({
        where: { userId: auth.userId },
        update: { photoUrl },
        create: { userId: auth.userId, photoUrl },
      }),
      prisma.user.update({
        where: { id: auth.userId },
        data: { image: photoUrl },
      }),
    ]);

    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error("Profile photo upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
