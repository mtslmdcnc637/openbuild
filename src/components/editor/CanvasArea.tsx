
"use client";

import React, { DragEvent } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { RenderedElement } from './RenderedElement';
import type { DraggableItem } from '@/types/editor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function CanvasArea() {
  const { elements, addElement, selectElement, viewportMode, moveElement, pageSettings } = useEditor();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemDataString = e.dataTransfer.getData('application/json');
    if (!itemDataString) return;

    const item = JSON.parse(itemDataString) as DraggableItem | { id: string };

    if ('id' in item && item.id) {
      // moveElement(item.id, null);
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
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'canvas-content-wrapper') {
      selectElement(null);
    }
  };

  const canvasContentStyles: React.CSSProperties = {
    backgroundColor: pageSettings.bodyBackgroundColor || undefined, // Use undefined if empty to allow CSS fallback
    backgroundImage: pageSettings.bodyBackgroundImageUrl ? `url(${pageSettings.bodyBackgroundImageUrl})` : undefined,
    backgroundSize: 'cover', // Sensible default
    backgroundPosition: 'center', // Sensible default
    backgroundRepeat: 'no-repeat', // Sensible default
  };


  const canvasWrapperClasses = cn(
    "mx-auto transition-all duration-300 ease-in-out shadow-lg", // Removed bg-background here, will be set by canvasContentStyles
    "border-2 border-dashed border-transparent",
    "drag-over-active:border-accent drag-over-active:bg-accent/10",
    {
      'w-full min-h-full': viewportMode === 'desktop',
      'max-w-2xl w-full border border-border bg-card': viewportMode === 'tablet', // bg-card for tablet/mobile to contrast with editor bg
      'max-w-sm w-full border border-border bg-card': viewportMode === 'mobile', // bg-card for tablet/mobile
    }
  );

  const canvasContentHeight = elements.length === 0
    ? (viewportMode === 'desktop' ? 'calc(100vh - 150px)' : '80vh')
    : 'auto';


  return (
    <ScrollArea
      className="h-full flex-grow relative"
    >
      <div
        id="canvas-root-wrapper"
        className={cn(
          "p-4 md:p-8 min-h-full w-full flex",
          viewportMode !== 'desktop' ? "items-start justify-center" : ""
        )}
        onClick={handleCanvasClick}
      >
        <div
          id="canvas-content-wrapper"
          className={canvasWrapperClasses}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            ...canvasContentStyles, // Apply dynamic body styles here
            minHeight: canvasContentHeight,
            height: elements.length > 0 ? 'auto' : undefined
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
      </div>
    </ScrollArea>
  );
}
