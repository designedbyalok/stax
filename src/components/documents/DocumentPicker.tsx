"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function DocumentPicker({
  type,
  value,
  onChange,
  onUploadClick,
}: {
  type: "RESUME" | "COVER_LETTER";
  value: string | null;
  onChange: (id: string | null) => void;
  onUploadClick?: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["documents", type],
    queryFn: () => api.listDocuments(type).then((res) => res.documents),
  });

  const docs = data ?? [];
  const selectedDoc = docs.find((d) => d.id === value);

  return (
    <Select
      value={value ?? "none"}
      onValueChange={(val) => {
        if (val === "upload") {
          onUploadClick?.();
        } else if (val === "none") {
          onChange(null);
        } else {
          onChange(val);
        }
      }}
    >
      <SelectTrigger className="w-full text-sm font-medium h-9">
        <SelectValue placeholder={`Select ${type === "RESUME" ? "resume" : "cover letter"}`}>
          {selectedDoc ? (
            <div className="flex items-center gap-2 truncate">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{selectedDoc.name}</span>
              {selectedDoc.isPrimary && (
                <Badge variant="secondary" className="text-[9px] uppercase h-4 px-1 rounded-[3px] ml-auto">Primary</Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground font-normal">None attached</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none" className="text-muted-foreground italic">None</SelectItem>
        {docs.map((doc) => (
          <SelectItem key={doc.id} value={doc.id}>
            <div className="flex items-center gap-2 w-full">
              <span className="truncate">{doc.name}</span>
              {doc.isPrimary && (
                <span className="text-[9px] uppercase font-semibold bg-secondary text-secondary-foreground px-1 py-0 rounded-[3px] shrink-0">
                  Pri
                </span>
              )}
            </div>
          </SelectItem>
        ))}
        {onUploadClick && (
          <SelectItem value="upload" className="font-medium text-primary">
            <div className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Upload new…
            </div>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
