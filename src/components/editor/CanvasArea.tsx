
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
    
    const item = JSON.parse(itemDataString) as DraggableItem | { id: string }; 

    if ('id' in item && item.id) {
      // Lógica para reordenar no canvas raiz.
      // Por simplicidade, permitimos apenas soltar novos elementos na raiz por enquanto.
      // moveElement(item.id, null); // targetId nulo significa raiz
    } 
    else if ('type' in item && item.type) {
      addElement(item.type);
    }
    e.currentTarget.classList.remove('drag-over-active');
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "copy";
    e.currentTarget.classList.add('drag-over-active');
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over-active');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
           height: elements.length === 0 ? 'calc(100vh - 150px)' : 'auto' 
        }}
      >
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            <p>Arraste e solte os elementos aqui</p>
          </div>
        )}
        {elements.map((element, index) => (
          <RenderedElement key={element.id} element={element} path={String(index)} />
        ))}
      </div>
    </ScrollArea>
  );
}
