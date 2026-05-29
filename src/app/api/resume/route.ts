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

  const initialContent = {
    basics: {
      name: "Ariel Norling",
      label: "Product Designer",
      email: "arielnorling@gmail.com",
      phone: "(210) 326-5459",
      url: "arielnorling.com",
      location: "",
      headline: "",
      summary: "",
    },
    work: [
      {
        id: "w1",
        company: "Casetext",
        position: "Product Designer",
        startDate: "August 2016",
        endDate: "September 2017",
        summary: "I led the design vision and helped to set product direction and manage two designers. I designed new features and overhauled the visual design for product and marketing. I created the hiring criteria and interview process for the design team and hired two designers. I also advised on HR and hiring processes company-wide.",
      },
      {
        id: "w2",
        company: "EdSurge",
        position: "UX Designer",
        startDate: "June 2016",
        endDate: "August 2016",
        summary: "I worked on a contract project with the Summits team to redesign their website. The project involved working with stakeholders across EdSurge to conduct needfinding, creating a new information architecture schema and content strategy, and designing sketches, flow diagrams, wireframes, and mockups.",
      },
      {
        id: "w3",
        company: "Whil",
        position: "Senior Designer",
        startDate: "August 2015",
        endDate: "February 2016",
        summary: "I was the only product designer at Whil. I designed the home page, dashboard, favorites page, pricing page, onboarding experience, training reminders experience, and the leadership course experience. I also collaborated with other designers on the design of the office space, and was a member of the Culture Team.",
      },
      {
        id: "w4",
        company: "NoWait",
        position: "Design Intern",
        startDate: "August 2014",
        endDate: "December 2014",
        summary: "I designed the user flows and visual styles for new features. I designed presentations and print materials for the marketing and sales teams. I also created the style guides for NoWait's guest iOS and Android apps.",
      },
      {
        id: "w5",
        company: "BetaMatch",
        position: "Co-Founder & Designer",
        startDate: "March 2013",
        endDate: "October 2013",
        summary: "I designed all of the branding, user experience, and visual designs. I collaborated with engineers to code the front-end. I also conducted market research and user feedback sessions.",
      }
    ],
    education: [
      {
        id: "e1",
        institution: "Carnegie Mellon University",
        area: "Educational Technology and Applied Learning Science",
        studyType: "Master's in",
        startDate: "August 2014",
        endDate: "August 2015",
      },
      {
        id: "e2",
        institution: "Syracuse University",
        area: "Information Management",
        studyType: "Master's of Science in",
        startDate: "August 2012",
        endDate: "",
      },
      {
        id: "e3",
        institution: "Syracuse University",
        area: "Policy Studies",
        studyType: "Bachelor of Arts in",
        startDate: "August 2009",
        endDate: "May 2012",
      }
    ],
    skills: [
      { id: "s1", name: "Adobe XD", level: "" },
      { id: "s2", name: "Sketch", level: "" },
      { id: "s3", name: "Figma", level: "" },
      { id: "s4", name: "Atomic", level: "" },
      { id: "s5", name: "InVision", level: "" },
      { id: "s6", name: "After Effects", level: "" },
      { id: "s7", name: "Principle", level: "" },
      { id: "s8", name: "Framer", level: "" },
      { id: "s9", name: "Photoshop", level: "" },
      { id: "s10", name: "Illustrator", level: "" },
      { id: "s11", name: "InDesign", level: "" },
      { id: "s12", name: "HTML", level: "" },
      { id: "s13", name: "CSS", level: "" },
      { id: "s14", name: "Javascript", level: "" }
    ],
    design: {
      template: "split",
      themeColor: "#000000",
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
