"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Kanban, FileText, Bell, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Track Your Applications",
    description: "Keep all your job applications organized in a beautiful Kanban board. Drag and drop to update statuses instantly.",
    icon: Kanban,
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Store Documents",
    description: "Upload your resumes and cover letters so you never lose track of what you sent to whom.",
    icon: FileText,
    color: "from-pink-500 to-rose-400"
  },
  {
    title: "Smart Reminders",
    description: "Stax will automatically remind you to follow up if a company ghosts you. Never let an opportunity slip away.",
    icon: Bell,
    color: "from-orange-500 to-amber-400"
  },
  {
    title: "Interview Prep",
    description: "Save frequent questions, star stories, and checklists so you're always ready to ace your interviews.",
    icon: CheckSquare,
    color: "from-purple-500 to-indigo-400"
  }
];

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem("stax_has_seen_welcome");
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("stax_has_seen_welcome", "true");
  };

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 border-0 overflow-hidden bg-background">
         <DialogHeader className="sr-only">
           <DialogTitle>Welcome to Stax</DialogTitle>
         </DialogHeader>
         <div className="relative pt-16 pb-8 px-8 flex flex-col items-center text-center bg-gradient-to-br from-indigo-50/50 via-background to-pink-50/50 min-h-[520px]">
           {/* Visual Element */}
           <div className="relative mb-10 w-48 h-48 flex items-center justify-center">
             {/* Background blur/glow */}
             <div className={cn("absolute inset-0 blur-3xl opacity-20 bg-gradient-to-br rounded-full transition-colors duration-500", currentStep.color)} />
             
             {/* Floating card */}
             <div className="relative w-40 h-52 bg-card border shadow-xl rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all duration-500 hover:scale-105">
                <Icon className={cn("w-12 h-12 text-muted-foreground/30")} />
             </div>

             {/* Little floating badge (like the feather in the mockup) */}
             <div className={cn("absolute -top-4 -right-4 w-14 h-14 rounded-full border-4 border-background bg-gradient-to-br shadow-lg flex items-center justify-center text-white transition-colors duration-500", currentStep.color)}>
               <Icon className="w-6 h-6" />
             </div>
           </div>

           {/* Carousel Dots */}
           <div className="flex items-center gap-1.5 mb-8">
             {STEPS.map((_, i) => (
               <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === step ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30")} />
             ))}
           </div>

           {/* Text */}
           <h2 className="text-2xl font-bold text-foreground mb-3">{currentStep.title}</h2>
           <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[320px] mb-10 min-h-[60px]">
             {currentStep.description}
           </p>

           {/* Buttons */}
           <div className="flex items-center justify-between w-full mt-auto max-w-[280px]">
             <Button 
                variant="ghost" 
                size="sm" 
                className={cn("text-muted-foreground", step === 0 && "opacity-0 pointer-events-none")}
                onClick={() => setStep(s => Math.max(0, s - 1))}
              >
               <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
             </Button>
             
             <Button 
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90 border-0 text-white shadow-md shadow-orange-500/20"
                onClick={() => {
                  if (step < STEPS.length - 1) {
                    setStep(s => s + 1);
                  } else {
                    handleClose();
                  }
                }}
              >
               {step === STEPS.length - 1 ? "Get Started" : "Next"} <ArrowRight className="w-4 h-4 ml-1.5" />
             </Button>
           </div>
         </div>
      </DialogContent>
    </Dialog>
  );
}
