"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Star, Link as LinkIcon, Trash2, Edit2 } from "lucide-react";
import { api, ApiInterviewQuestion } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export function QuestionsLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => api.listQuestions().then((r) => r.questions),
  });

  const createMutation = useMutation({
    mutationFn: () => api.createQuestion({ question: newQuestionText.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setIsAdding(false);
      setNewQuestionText("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiInterviewQuestion> }) => 
      api.updateQuestion(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteQuestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questions"] }),
  });

  const filtered = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      q.application?.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const startEditing = (q: ApiInterviewQuestion) => {
    setEditingId(q.id);
    setEditAnswer(q.yourAnswer || "");
  };

  const saveEdit = (id: string) => {
    updateMutation.mutate({ id, data: { yourAnswer: editAnswer } });
    setEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="px-6 h-12 border-b flex items-center justify-between gap-4 shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">Question Library</h1>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Question
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions, tags, or companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isAdding && (
            <div className="border rounded-lg bg-card p-4 space-y-3 shadow-sm">
              <h3 className="text-sm font-medium">Add a new question</h3>
              <Textarea
                placeholder="What is your biggest weakness?"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="min-h-[80px]"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setNewQuestionText(""); }}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  disabled={!newQuestionText.trim() || createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                >
                  {createMutation.isPending ? "Adding..." : "Add Question"}
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg bg-card overflow-hidden">
                  <div className="p-4 border-b flex items-start justify-between gap-4">
                    <div className="w-full space-y-2.5">
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                  </div>
                  <div className="p-4 bg-muted/10">
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center text-center border border-dashed rounded-lg bg-muted/10">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">No questions found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {search ? "We couldn't find any questions matching your search." : "Questions you save during interview prep will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 stagger-list">
              {filtered.map((q) => (
                <div key={q.id} className="border rounded-lg bg-card overflow-hidden card-lift hover:border-foreground/15">
                  <div className="p-4 border-b flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium text-[14px]">{q.question}</h3>
                      {q.application && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <LinkIcon className="h-3 w-3" />
                          Asked by <span className="font-medium text-foreground">{q.application.companyName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 ${q.isFrequent ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground"}`}
                        onClick={() => updateMutation.mutate({ id: q.id, data: { isFrequent: !q.isFrequent } })}
                        title={q.isFrequent ? "Remove frequent mark" : "Mark as frequent"}
                      >
                        <Star className="h-4 w-4" fill={q.isFrequent ? "currentColor" : "none"} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this question?")) {
                            deleteMutation.mutate(q.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/10">
                    {editingId === q.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          placeholder="Draft your best answer here..."
                          className="min-h-[100px] text-[13px]"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => saveEdit(q.id)}>Save Answer</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        {q.yourAnswer ? (
                          <div className="text-[13px] whitespace-pre-wrap">{q.yourAnswer}</div>
                        ) : (
                          <div className="text-[13px] text-muted-foreground italic">No answer drafted yet.</div>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 h-6 text-[10px] px-2 transition-opacity"
                          onClick={() => startEditing(q)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
