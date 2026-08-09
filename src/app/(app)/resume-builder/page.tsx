import { Suspense } from "react";
import { ResumeClient } from "@/components/resume-builder/ResumeClient";

export default function ResumeBuilderPage() {
  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <ResumeClient />
      </Suspense>
    </div>
  );
}
