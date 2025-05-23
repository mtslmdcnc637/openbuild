"use client";

import type { DraggableItem } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';

interface DraggableElementItemProps {
  item: DraggableItem;
}

export function DraggableElementItem({ item }: DraggableElementItemProps) {
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start cursor-grab active:cursor-grabbing flex items-center gap-2 mb-2 shadow-sm hover:shadow-md transition-shadow"
      draggable
      onDragStart={handleDragStart}
      aria-label={`Drag to add ${item.label}`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm">{item.label}</span>
    </Button>
  );
}
