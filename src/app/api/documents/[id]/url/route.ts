import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "File storage isn't configured." },
      { status: 503 }
    );
  }

  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id, userId: auth.userId },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(document.storageKey, 300); // 5 minutes

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Failed to generate URL" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
