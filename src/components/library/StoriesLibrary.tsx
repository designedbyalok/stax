"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Trash2, Edit2, ThumbsUp } from "@/components/icons";
import { api, ApiStarStory } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function StoriesLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Partial<ApiStarStory>>({});

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: () => api.listStories().then((r) => r.stories),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ApiStarStory>) => api.createStory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setModalOpen(false);
      setEditingStory({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiStarStory> }) => 
      api.updateStory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setModalOpen(false);
      setEditingStory({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteStory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });

  const filtered = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.situation.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const openEditor = (story?: ApiStarStory) => {
    if (story) {
      setEditingStory(story);
    } else {
      setEditingStory({ title: "", situation: "", task: "", action: "", result: "" });
    }
    setModalOpen(true);
  };

  const saveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStory.id) {
      updateMutation.mutate({ id: editingStory.id, data: editingStory });
    } else {
      createMutation.mutate(editingStory);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="px-6 h-12 border-b flex items-center justify-between gap-4 shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">STAR Stories</h1>
        <Button size="sm" className="h-7 text-xs" onClick={() => openEditor()}>
          <Plus className="h-3 w-3 mr-1" />
          New Story
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg bg-card p-4 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-1 shrink-0">
                      <Skeleton className="h-6 w-6 rounded-md" />
                      <Skeleton className="h-6 w-6 rounded-md" />
                      <Skeleton className="h-6 w-6 rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-4/6" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center text-center border border-dashed rounded-lg bg-muted/10">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">No STAR stories found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {search ? "We couldn't find any stories matching your search." : "Add your best behavioral interview stories here."}
              </p>
              {!search && (
                <Button variant="secondary" size="sm" className="mt-6" onClick={() => openEditor()}>
                  Add your first story
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-list">
              {filtered.map((s) => (
                <div key={s.id} className="border rounded-lg bg-card p-4 flex flex-col card-lift hover:border-foreground/20">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-medium text-[14px] leading-tight">{s.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${s.workedWell ? "text-green-500 hover:text-green-600" : "text-muted-foreground"}`}
                        onClick={() => updateMutation.mutate({ id: s.id, data: { workedWell: !s.workedWell } })}
                        title="Worked well in interviews"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditor(s)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this story?")) deleteMutation.mutate(s.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex-1 text-[12px] text-muted-foreground line-clamp-6">
                    <p><strong className="text-foreground">S:</strong> {s.situation}</p>
                    <p><strong className="text-foreground">T:</strong> {s.task}</p>
                    <p><strong className="text-foreground">A:</strong> {s.action}</p>
                    <p><strong className="text-foreground">R:</strong> {s.result}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>{editingStory.id ? "Edit STAR Story" : "New STAR Story"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveStory} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Title / Theme</Label>
                <Input 
                  required
                  placeholder="e.g. Dealing with a difficult stakeholder"
                  value={editingStory.title || ""}
                  onChange={e => setEditingStory({...editingStory, title: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Situation (Context & Background)</Label>
                <Textarea 
                  className="h-24 text-[13px]"
                  value={editingStory.situation || ""}
                  onChange={e => setEditingStory({...editingStory, situation: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Task (What you needed to do)</Label>
                <Textarea 
                  className="h-20 text-[13px]"
                  value={editingStory.task || ""}
                  onChange={e => setEditingStory({...editingStory, task: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Action (What you actually did)</Label>
                <Textarea 
                  className="h-24 text-[13px]"
                  value={editingStory.action || ""}
                  onChange={e => setEditingStory({...editingStory, action: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Result (The outcome)</Label>
                <Textarea 
                  className="h-20 text-[13px]"
                  value={editingStory.result || ""}
                  onChange={e => setEditingStory({...editingStory, result: e.target.value})}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t shrink-0 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save Story</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
