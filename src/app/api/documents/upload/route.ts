import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as "RESUME" | "COVER_LETTER";
    const isPrimaryStr = formData.get("isPrimary") as string;
    const notes = formData.get("notes") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }
    
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and DOCX are allowed." }, { status: 400 });
    }

    const isPrimary = isPrimaryStr === "true";
    const ext = file.name.split(".").pop();
    const storageKey = `${auth.userId}/${nanoid()}.${ext}`;

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storageKey, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Failed to upload file: " + uploadError.message }, { status: 500 });
    }

    let document;
    await prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.document.updateMany({
          where: { userId: auth.userId, type, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      document = await tx.document.create({
        data: {
          userId: auth.userId,
          type,
          name,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          storageKey,
          notes,
          isPrimary,
        },
      });
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
