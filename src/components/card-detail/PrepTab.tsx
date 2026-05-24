"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Square, Trash2, Plus, FileText, AlignLeft, Send, Sparkles } from "lucide-react";
import { api, ApiApplication, ApiApplicationDetail } from "@/lib/api-client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PrepTab({
  card,
  detail,
}: {
  card: ApiApplication;
  detail: ApiApplicationDetail | null | undefined;
}) {
  void detail;
  const queryClient = useQueryClient();
  const [newItemText, setNewItemText] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [reflectionText, setReflectionText] = useState("");
  const [askedQuestionText, setAskedQuestionText] = useState("");

  const { data: globalQuestions } = useQuery({
    queryKey: ["questions"],
    queryFn: () => api.listQuestions().then(r => r.questions),
  });
  const appQuestions = globalQuestions?.filter(q => q.applicationId === card.id) || [];

  const createQuestionMutation = useMutation({
    mutationFn: (text: string) => api.createQuestion({ 
      question: text, 
      applicationId: card.id,
      tags: [card.roleTitle, card.companyName].filter(Boolean) as string[]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      setAskedQuestionText("");
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => api.deleteQuestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questions"] }),
  });

  const { data: checklistData } = useQuery({
    queryKey: ["prepChecklist", card.id],
    queryFn: () => api.getPrepChecklist(card.id).then(r => r.checklist),
  });

  const checklist = checklistData || {
    items: [],
    notes: "",
    reflection: "",
    questionsToAsk: []
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updatePrepChecklist(card.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prepChecklist", card.id] }),
  });

  const toggleChecklistItem = (idx: number) => {
    const newItems = [...checklist.items];
    newItems[idx].checked = !newItems[idx].checked;
    updateMutation.mutate({ items: newItems });
  };

  const addChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItems = [...checklist.items, { text: newItemText, checked: false }];
    updateMutation.mutate({ items: newItems });
    setNewItemText("");
  };

  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const newQuestions = [...checklist.questionsToAsk, { text: newQuestionText }];
    updateMutation.mutate({ questionsToAsk: newQuestions });
    setNewQuestionText("");
  };

  const removeChecklistItem = (idx: number) => {
    const newItems = checklist.items.filter((_, i) => i !== idx);
    updateMutation.mutate({ items: newItems });
  };

  const removeQuestion = (idx: number) => {
    const newQuestions = checklist.questionsToAsk.filter((_, i) => i !== idx);
    updateMutation.mutate({ questionsToAsk: newQuestions });
  };

  const saveReflection = () => {
    updateMutation.mutate({ reflection: reflectionText });
    setReflectionText("");
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
      {/* Context Section */}
      <div className="space-y-3 p-4 bg-muted/20 border rounded-lg">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Role Context
        </h3>
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <span className="text-muted-foreground block mb-0.5 text-[11px] uppercase">Company</span>
            <div className="font-medium">{card.companyName}</div>
          </div>
          <div>
            <span className="text-muted-foreground block mb-0.5 text-[11px] uppercase">Role</span>
            <div className="font-medium">{card.roleTitle}</div>
          </div>
        </div>
      </div>

      {/* Prep Section */}
      <div className="space-y-5">
        <h3 className="font-medium text-sm flex items-center gap-2 border-b pb-2">
          <CheckSquare className="h-4 w-4" />
          Preparation
        </h3>

        <div className="space-y-2">
          <Label>Pre-interview Checklist</Label>
          <div className="space-y-1.5 mb-3">
            {checklist.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                <button 
                  onClick={() => toggleChecklistItem(idx)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  {item.checked ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                </button>
                <span className={`text-[13px] flex-1 ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                  {item.text}
                </span>
                <button 
                  onClick={() => removeChecklistItem(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={addChecklistItem} className="flex gap-2">
            <Input 
              placeholder="E.g., Review STAR stories" 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="h-8 text-xs"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-8 px-3">
              <Plus className="h-3 w-3" />
            </Button>
          </form>
        </div>

        <div className="space-y-2">
          <Label>Notes & Research</Label>
          <Textarea 
            placeholder="Key facts about the company, interviewer backgrounds..."
            defaultValue={checklist.notes || ""}
            onBlur={(e) => updateMutation.mutate({ notes: e.target.value })}
            className="text-[13px] min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Questions to Ask Them</Label>
          <div className="space-y-2 mb-3">
            {checklist.questionsToAsk.map((q, idx) => (
              <div key={idx} className="flex items-start gap-2 group text-[13px] bg-muted/30 p-2 rounded border">
                <span className="flex-1">{q.text}</span>
                <button 
                  onClick={() => removeQuestion(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={addQuestion} className="flex gap-2">
            <Input 
              placeholder="What does success look like in this role?" 
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="h-8 text-xs"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-8 px-3">
              <Plus className="h-3 w-3" />
            </Button>
          </form>
        </div>
      </div>

      {/* Post-Interview Section */}
      <div className="space-y-5">
        <h3 className="font-medium text-sm flex items-center gap-2 border-b pb-2 text-primary">
          <Sparkles className="h-4 w-4" />
          After the Interview
        </h3>

        <div className="space-y-2">
          <Label>Reflection & Takeaways</Label>
          <div className="space-y-3">
            {checklist.reflection ? (
              <div className="p-3 bg-muted/30 border rounded-md text-[13px] whitespace-pre-wrap relative group">
                {checklist.reflection}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={() => updateMutation.mutate({ reflection: "" })}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea 
                  placeholder="How did it go? What did you learn? What mistakes did you make?"
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  className="text-[13px] min-h-[100px]"
                />
                <Button size="sm" className="w-full h-8" onClick={saveReflection} disabled={!reflectionText.trim()}>
                  <Send className="h-3 w-3 mr-2" />
                  Save Reflection
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <Label>Questions They Asked Me</Label>
          <p className="text-[11px] text-muted-foreground mb-3">
            Save interesting or difficult questions they asked you. They will be added to your global Questions Library for future practice.
          </p>
          
          <div className="space-y-2 mb-3">
            {appQuestions.map((q) => (
              <div key={q.id} className="flex items-start gap-2 group text-[13px] bg-muted/30 p-2 rounded border">
                <span className="flex-1">{q.question}</span>
                <button 
                  onClick={() => deleteQuestionMutation.mutate(q.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (askedQuestionText.trim()) createQuestionMutation.mutate(askedQuestionText);
          }} className="flex gap-2">
            <Input 
              placeholder="e.g. Tell me about a time you failed..." 
              value={askedQuestionText}
              onChange={(e) => setAskedQuestionText(e.target.value)}
              className="h-8 text-xs"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-8 px-3" disabled={createQuestionMutation.isPending}>
              <Plus className="h-3 w-3" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
