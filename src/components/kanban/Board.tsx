"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Column } from "./Column";
import { KanbanCard } from "./Card";
import { CardDrawer } from "../card-detail/CardDrawer";
import { useSelectedCard } from "./selected-card-store";
import { api, ApiApplication, ApiColumn } from "@/lib/api-client";
import { useFilteredApplications } from "@/lib/use-filtered-applications";
import { ApplyCheckpointModal } from "@/components/apply-checkpoint/ApplyCheckpointModal";
import { Skeleton } from "@/components/ui/skeleton";

export type Application = ApiApplication;

export default function Board() {
  const queryClient = useQueryClient();
  const [activeCard, setActiveCard] = useState<ApiApplication | null>(null);
  const selectedCardId = useSelectedCard((s) => s.selectedCardId);
  const setSelectedCardId = useSelectedCard((s) => s.select);
  
  const [checkpointData, setCheckpointData] = useState<{ card: ApiApplication; columnId: string; beforeId: string | null } | null>(null);

  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });
  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.listApplications().then((r) => r.applications),
  });

  const settingsQuery = useQuery({
    queryKey: ["userSettings"],
    queryFn: api.getUserSettings,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const moveMutation = useMutation({
    mutationFn: ({
      id,
      columnId,
      beforeId,
    }: {
      id: string;
      columnId: string;
      beforeId: string | null;
    }) => api.moveApplication(id, { columnId, beforeId }),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to move card.");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const visibleColumns = useMemo<ApiColumn[]>(() => {
    const cols = columnsQuery.data ?? [];
    return cols.filter((c) => !c.isArchive);
  }, [columnsQuery.data]);

  const filteredApps = useFilteredApplications(applicationsQuery.data);

  const cardsByColumn = useMemo(() => {
    const map = new Map<string, ApiApplication[]>();
    for (const col of columnsQuery.data ?? []) map.set(col.id, []);
    for (const app of filteredApps) {
      if (!map.has(app.columnId)) map.set(app.columnId, []);
      map.get(app.columnId)!.push(app);
    }
    for (const list of map.values()) list.sort((a, b) => a.position - b.position);
    return map;
  }, [filteredApps, columnsQuery.data]);

  const selectedCard =
    applicationsQuery.data?.find((a) => a.id === selectedCardId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    const cards = applicationsQuery.data ?? [];
    const card = cards.find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const cards = applicationsQuery.data ?? [];
    const activeCardData = cards.find((c) => c.id === active.id);
    if (!activeCardData) return;

    // Determine target column + the card we're dropping before.
    const overId = String(over.id);
    let targetColumnId: string;
    let beforeId: string | null = null;

    const overColumn = (columnsQuery.data ?? []).find((c) => c.id === overId);
    if (overColumn) {
      // Dropped onto an empty column or beneath all cards.
      targetColumnId = overColumn.id;
      beforeId = null;
    } else {
      const overCard = cards.find((c) => c.id === overId);
      if (!overCard) return;
      targetColumnId = overCard.columnId;
      beforeId = overCard.id;
    }

    // No-op if dropped onto itself.
    if (beforeId === activeCardData.id) return;

    // Check for Apply checkpoint
    const targetColumn = (columnsQuery.data ?? []).find(c => c.id === targetColumnId);
    if (targetColumn?.name.toLowerCase() === "applied" && !settingsQuery.data?.skipApplyCheckpoint) {
      setCheckpointData({ card: activeCardData, columnId: targetColumnId, beforeId });
      return; // Wait for user confirmation
    }

    doMove(activeCardData, targetColumnId, beforeId);
  }

  function doMove(activeCardData: ApiApplication, targetColumnId: string, beforeId: string | null) {
    // Optimistic update.
    queryClient.setQueryData<ApiApplication[]>(["applications"], (prev) => {
      if (!prev) return prev;
      const withoutActive = prev.filter((c) => c.id !== activeCardData.id);
      const targetList = withoutActive
        .filter((c) => c.columnId === targetColumnId)
        .sort((a, b) => a.position - b.position);

      let newPosition: number;
      if (beforeId) {
        const idx = targetList.findIndex((c) => c.id === beforeId);
        const prevCard = idx > 0 ? targetList[idx - 1] : null;
        const beforeCard = targetList[idx];
        newPosition = prevCard
          ? Math.floor((prevCard.position + beforeCard.position) / 2) || prevCard.position + 1
          : beforeCard.position - 1024;
      } else {
        const last = targetList[targetList.length - 1];
        newPosition = last ? last.position + 1024 : 1024;
      }

      return [
        ...withoutActive,
        { ...activeCardData, columnId: targetColumnId, position: newPosition },
      ];
    });

    moveMutation.mutate({
      id: activeCardData.id,
      columnId: targetColumnId,
      beforeId,
    });
  }

  if (columnsQuery.isLoading || applicationsQuery.isLoading) {
    return (
      <div className="flex gap-3 h-full overflow-hidden pb-2 opacity-50">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] flex flex-col gap-3">
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
              {i % 2 === 0 && <Skeleton className="h-24 w-full rounded-md" />}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (columnsQuery.isError || applicationsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-destructive">
        Couldn&apos;t load the board. Try refreshing.
      </div>
    );
  }

  if (!visibleColumns.length) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
        No columns yet. Try refreshing.
      </div>
    );
  }

  const hasCards = (applicationsQuery.data?.length ?? 0) > 0;
  const isFirstColumn = (col: ApiColumn) =>
    col.id === visibleColumns[0]?.id;

  return (
    <div className="h-full flex flex-col">
      <DndContext
        id="board-dnd-context"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 h-full overflow-x-auto scroll-soft pb-2">
          {visibleColumns.map((col) => (
            <Column
              key={col.id}
              column={{ id: col.id, title: col.name, color: col.color }}
              cards={cardsByColumn.get(col.id) ?? []}
              onCardClick={(card) => setSelectedCardId(card.id)}
              showEmptyHint={!hasCards && isFirstColumn(col)}
              showPlaceholders={!hasCards && isFirstColumn(col)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <CardDrawer
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCardId(null)}
      />

      {checkpointData && (
        <ApplyCheckpointModal
          open={!!checkpointData}
          onOpenChange={(open) => !open && setCheckpointData(null)}
          card={checkpointData.card}
          onConfirm={() => {
            doMove(checkpointData.card, checkpointData.columnId, checkpointData.beforeId);
            setCheckpointData(null);
          }}
          onCancel={() => setCheckpointData(null)}
        />
      )}
    </div>
  );
}
