
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
      // moveElement(item.id, null); // Lógica de mover existente, se necessário
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

  const pageStyleOverrides: React.CSSProperties = {
    backgroundColor: pageSettings.bodyBackgroundColor || undefined,
    backgroundImage: pageSettings.bodyBackgroundImageUrl ? `url(${pageSettings.bodyBackgroundImageUrl})` : undefined,
    backgroundSize: pageSettings.bodyBackgroundImageUrl ? 'cover' : undefined,
    backgroundPosition: pageSettings.bodyBackgroundImageUrl ? 'center' : undefined,
    backgroundRepeat: pageSettings.bodyBackgroundImageUrl ? 'no-repeat' : undefined,
  };


  const canvasWrapperClasses = cn(
    "mx-auto transition-all duration-300 ease-in-out shadow-lg",
    "border-2 border-dashed border-transparent", // Para feedback de drag-over
    "drag-over-active:border-accent drag-over-active:bg-accent/10",
    {
      'w-full': viewportMode === 'desktop',
      'max-w-2xl w-full border border-border bg-card': viewportMode === 'tablet',
      'max-w-sm w-full border border-border bg-card': viewportMode === 'mobile',
    }
  );

  // Define a altura mínima consistente para o canvas content wrapper
  // Ajuste o valor '150px' se a altura do cabeçalho + paddings mudar.
  const canvasContentMinHeight = viewportMode === 'desktop'
    ? 'calc(100vh - 130px)' // Altura total da viewport menos altura do header e paddings verticais
    : '80vh'; // Para tablet/mobile, onde o canvas é centralizado e pode ter mais espaço ao redor.

  return (
    <ScrollArea
      className="h-full flex-grow relative" // ScrollArea ocupa todo o espaço disponível
    >
      <div
        id="canvas-root-wrapper"
        className={cn(
          "p-4 md:p-8 min-h-full w-full flex", // min-h-full aqui garante que o wrapper ocupe a altura do ScrollArea
          viewportMode !== 'desktop' ? "items-start justify-center" : "" // Centraliza em tablet/mobile
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
            ...pageStyleOverrides,
            minHeight: canvasContentMinHeight, // Aplica a altura mínima consistente
            // height: 'auto' é o padrão para divs, permitindo que cresça com o conteúdo
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
