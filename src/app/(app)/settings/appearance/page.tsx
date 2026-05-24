"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium tracking-tight">Appearance</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the look and feel of Stax.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Theme</CardTitle>
          <CardDescription>Select a theme for your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                theme === "light" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <div className="w-24 h-16 rounded-md bg-white border shadow-sm flex flex-col overflow-hidden">
                <div className="h-4 bg-gray-100 border-b flex items-center px-1.5 gap-1 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                </div>
                <div className="flex-1 flex p-1.5 gap-1.5">
                  <div className="w-4 h-full bg-gray-100 rounded-sm" />
                  <div className="flex-1 h-full bg-gray-50 rounded-sm border border-gray-100" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sun className="h-4 w-4" /> Light
              </div>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                theme === "dark" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <div className="w-24 h-16 rounded-md bg-zinc-950 border border-zinc-800 shadow-sm flex flex-col overflow-hidden">
                <div className="h-4 bg-zinc-900 border-b border-zinc-800 flex items-center px-1.5 gap-1 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 flex p-1.5 gap-1.5">
                  <div className="w-4 h-full bg-zinc-900 rounded-sm" />
                  <div className="flex-1 h-full bg-zinc-900 rounded-sm border border-zinc-800" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Moon className="h-4 w-4" /> Dark
              </div>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                theme === "system" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
              }`}
            >
              <div className="w-24 h-16 rounded-md bg-gradient-to-br from-white to-zinc-950 border shadow-sm flex flex-col overflow-hidden">
                <div className="h-4 bg-gray-100/50 backdrop-blur border-b border-gray-200/20 flex items-center px-1.5 gap-1 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                </div>
                <div className="flex-1 flex p-1.5 gap-1.5">
                  <div className="w-4 h-full bg-gray-100/50 rounded-sm" />
                  <div className="flex-1 h-full bg-gray-50/50 rounded-sm border border-gray-100/20" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Monitor className="h-4 w-4" /> System
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
