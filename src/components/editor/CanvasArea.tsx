"use client";

import React, { DragEvent } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { RenderedElement } from './RenderedElement';
import type { DraggableItem } from '@/types/editor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function CanvasArea() {
  const { elements, addElement, selectElement, selectedElement, moveElement } = useEditor();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemDataString = e.dataTransfer.getData('application/json');
    if (!itemDataString) return;
    
    const item = JSON.parse(itemDataString) as DraggableItem | { id: string }; // Item can be new or existing

    // If item has an ID, it's an existing element being moved
    if ('id' in item && item.id) {
      // Logic for reordering on root canvas.
      // For simplicity, we only allow dropping new elements on root for now.
      // moveElement(item.id, null); // null targetId means root
    } 
    // If item has a type, it's a new element from the panel
    else if ('type' in item && item.type) {
      addElement(item.type);
    }
    e.currentTarget.classList.remove('drag-over-active');
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "copy";
    e.currentTarget.classList.add('drag-over-active');
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over-active');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the click is directly on the canvas (not on an element), deselect.
    if (e.target === e.currentTarget) {
      selectElement(null);
    }
  };

  return (
    <ScrollArea className="h-full flex-grow bg-background relative">
      <div
        className={cn(
          "p-4 md:p-8 min-h-full w-full transition-colors",
          "border-2 border-dashed border-transparent",
          "drag-over-active:border-accent drag-over-active:bg-accent/10"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleCanvasClick}
        id="canvas-root"
        style={{
          // This is a fallback if min-h-full isn't enough, e.g. for absolutely positioned elements
          // or if ScrollArea somehow constrains its child.
          // Normally, min-h-full on the direct child of ScrollArea viewport should work.
           height: elements.length === 0 ? 'calc(100vh - 150px)' : 'auto' // Ensure droppable area when empty
        }}
      >
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            <p>Drag and drop elements here</p>
          </div>
        )}
        {elements.map((element, index) => (
          <RenderedElement key={element.id} element={element} path={String(index)} />
        ))}
      </div>
    </ScrollArea>
  );
}
