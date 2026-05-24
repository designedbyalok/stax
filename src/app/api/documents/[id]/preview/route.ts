import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { docxToHtml } from "@/lib/documents/docx-preview";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id, userId: auth.userId },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";

  if (document.mimeType === "application/pdf") {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(document.storageKey, 300);
    
    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: "Failed to generate URL" }, { status: 500 });
    }
    
    return NextResponse.json({ url: data.signedUrl });
  }

  // Handle DOCX
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(document.storageKey);

  if (error || !data) {
    return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
  }

  try {
    const buffer = Buffer.from(await data.arrayBuffer());
    const html = await docxToHtml(buffer);
    return NextResponse.json({ html });
  } catch (err) {
    console.error("Preview generation failed:", err);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
