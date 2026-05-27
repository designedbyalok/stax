import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ resumes });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const title = json.title || "My Resume";

  // Default empty content based on Reactive Resume schema simplified
  const initialContent = {
    basics: {
      name: session.user.name || "",
      email: session.user.email || "",
      phone: "",
      location: "",
      headline: "",
      summary: "",
    },
    work: [],
    education: [],
    skills: [],
    design: {
      template: "classic",
      themeColor: "#0f172a", // slate-900
      fontFamily: "sans",
      spacing: 1,
    }
  };

  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      title,
      content: initialContent,
    },
  });

  return NextResponse.json({ resume });
}
