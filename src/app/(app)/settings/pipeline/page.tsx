"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, GripVertical, Trash2, Check, X } from "@/components/icons";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiColumn } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRESET_COLORS = [
  "#E2E8F0", // Slate 200 (Default)
  "#FECACA", // Red 200
  "#FED7AA", // Orange 200
  "#FEF08A", // Yellow 200
  "#BBF7D0", // Green 200
  "#BFDBFE", // Blue 200
  "#E9D5FF", // Purple 200
  "#FBCFE8", // Pink 200
];

export default function PipelineSettings() {
  const queryClient = useQueryClient();

  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });

  const [newName, setNewName] = useState("");

  const createMutation = useMutation({
    mutationFn: (name: string) => api.createColumn({ name }),
    onSuccess: () => {
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Couldn't add column."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; position?: number; color?: string }) =>
      api.updateColumn(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["columns"] }),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Couldn't update column."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteColumn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Column deleted. Cards moved to the first column.");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Couldn't delete column."),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const visibleColumns = (columnsQuery.data ?? []).filter((c) => !c.isArchive);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = visibleColumns.findIndex((c) => c.id === active.id);
    const newIndex = visibleColumns.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(visibleColumns, oldIndex, newIndex);

    // Optimistically update cache
    queryClient.setQueryData<ApiColumn[]>(["columns"], (prev) => {
      if (!prev) return prev;
      const archives = prev.filter((c) => c.isArchive);
      const updated = reordered.map((c, i) => ({ ...c, position: i }));
      return [...updated, ...archives];
    });

    // Persist each new position
    reordered.forEach((c, i) => {
      if (c.position !== i) {
        updateMutation.mutate({ id: c.id, position: i });
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold">Columns</h2>
        <p className="text-xs text-muted-foreground">
          Drag to reorder. Click a name to rename.
        </p>

        {columnsQuery.isLoading ? (
          <div className="rounded-md border bg-card p-2 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="rounded-md border bg-card divide-y">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={visibleColumns.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
              {visibleColumns.map((col) => (
                <ColumnRow
                  key={col.id}
                  column={col}
                  onRename={(name) => updateMutation.mutate({ id: col.id, name })}
                  onChangeColor={(color) => updateMutation.mutate({ id: col.id, color })}
                  onDelete={() => {
                    if (
                      confirm(
                        `Delete "${col.name}"? Cards in it will move to the first column.`
                      )
                    ) {
                      deleteMutation.mutate(col.id);
                    }
                  }}
                  disableDelete={visibleColumns.length <= 1}
                />
              ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New column name"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) {
                createMutation.mutate(newName.trim());
              }
            }}
          />
          <Button
            size="sm"
            disabled={!newName.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate(newName.trim())}
          >
            <Plus className="h-3.5 w-3.5" />
            Add column
          </Button>
        </div>
      </section>
    </div>
  );
}

function ColumnRow({
  column,
  onRename,
  onChangeColor,
  onDelete,
  disableDelete,
}: {
  column: ApiColumn;
  onRename: (name: string) => void;
  onChangeColor: (color: string) => void;
  onDelete: () => void;
  disableDelete: boolean;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: column.id });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.name);

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  function commit() {
    const v = draft.trim();
    if (v && v !== column.name) onRename(v);
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-2 bg-card"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.75} />
      </button>

      {editing ? (
        <div className="flex-1 flex items-center gap-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(column.name);
                setEditing(false);
              }
            }}
          />
          <Button size="icon-sm" variant="ghost" onClick={commit}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              setDraft(column.name);
              setEditing(false);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(column.name);
            setEditing(true);
          }}
          className="flex-1 text-left text-[13px] py-1 px-1.5 rounded hover:bg-foreground/[0.04]"
        >
          {column.name}
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              className="shrink-0"
              aria-label="Change color"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-foreground/10"
                style={{ backgroundColor: column.color || PRESET_COLORS[0] }}
              />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-[120px] p-1.5 flex flex-wrap gap-1">
          {PRESET_COLORS.map((c) => (
            <DropdownMenuItem
              key={c}
              onClick={() => onChangeColor(c)}
              className="p-1 h-8 w-8 flex items-center justify-center cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full border border-foreground/10" style={{ backgroundColor: c }} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="icon-sm"
        variant="ghost"
        className="text-muted-foreground hover:text-destructive shrink-0"
        disabled={disableDelete}
        onClick={onDelete}
        aria-label="Delete column"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Button>
    </div>
  );
}
