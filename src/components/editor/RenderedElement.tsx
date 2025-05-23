
"use client";

import type { CSSProperties, DragEvent } from 'react';
import React from 'react';
import type { EditorElement } from '@/types/editor';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface RenderedElementProps {
  element: EditorElement;
  path: string; // e.g., "0.1.2" for hierarchical selection or identification
}

export function RenderedElement({ element, path }: RenderedElementProps) {
  const { selectElement, selectedElement, addElement, moveElement } = useEditor();

  const isSelected = selectedElement?.id === element.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
    selectElement(element.id);
  };

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (element.type === 'div') { // Only divs can be drop targets
        e.currentTarget.classList.add('drag-over-active');
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.stopPropagation();
    if (element.type === 'div') {
        e.currentTarget.classList.remove('drag-over-active');
    }
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (element.type === 'div') { // Ensure this is a droppable div
        e.currentTarget.classList.remove('drag-over-active');
    } else {
      return; // Don't allow dropping on non-divs
    }

    const itemDataString = e.dataTransfer.getData('application/json');
    if (!itemDataString) return;
    const item = JSON.parse(itemDataString);

    if (item.id) { 
        moveElement(item.id, element.id, 'inside');
    } else if (item.type) { 
        addElement(item.type, element.id);
    }
  };

  if (element.type === 'img') {
    const imgStyles = { ...element.styles };
    const imageWidth = parseInt(imgStyles.width?.toString() || '100');
    const imageHeight = parseInt(imgStyles.height?.toString() || '100');
    // Remove width/height from style object for the wrapper div, next/image uses props
    delete imgStyles.width;
    delete imgStyles.height;

    return (
      <div // Wrapper for selection, click events, and layout styles (margin, etc.)
        onClick={handleClick}
        style={{ display: 'inline-block', ...imgStyles }}
        className={cn(
          'outline-offset-2 transition-all duration-100 ease-in-out relative',
          isSelected ? 'outline outline-2 outline-accent ring-2 ring-accent' : 'outline outline-1 outline-transparent hover:outline-blue-300',
        )}
        data-element-id={element.id}
        data-element-type={element.type}
        // Images are typically not drop targets for other elements
      >
        <Image
          src={element.attributes?.src || 'https://placehold.co/100x100.png'}
          alt={element.attributes?.alt || 'Image'}
          width={imageWidth}
          height={imageHeight}
          style={{ objectFit: element.styles.objectFit as CSSProperties['objectFit'] || 'cover' }}
          data-ai-hint={element.attributes?.src?.includes('placehold.co') ? "abstract placeholder" : ""}
          draggable={false} // Prevent native image drag
        />
      </div>
    );
  }

  const Tag = element.type as keyof JSX.IntrinsicElements;

  return (
    <Tag
      style={element.styles}
      onClick={handleClick}
      onDragOver={element.type === 'div' ? handleDragOver : undefined}
      onDragLeave={element.type === 'div' ? handleDragLeave : undefined}
      onDrop={element.type === 'div' ? handleDrop : undefined}
      className={cn(
        'outline-offset-2 transition-all duration-100 ease-in-out',
        isSelected ? 'outline outline-2 outline-accent ring-2 ring-accent' : 'outline outline-1 outline-transparent hover:outline-blue-300',
        element.type === 'div' && 'min-h-[50px]', // ensure divs are droppable
        // Apply consistent drag-over styles for droppable divs
        element.type === 'div' && 'border-dashed border-transparent', // Default border style
        element.type === 'div' && 'drag-over-active:border-accent drag-over-active:bg-accent/10' // Style when 'drag-over-active' class is present
      )}
      data-element-id={element.id}
      data-element-type={element.type}
      {...element.attributes} // Spread other attributes for non-img tags
    >
      {element.content /* Render text content directly for p, h1, button, span etc. */}
      {/* Render children elements only for container types (implicitly, non-img types might have children) */}
      {element.children && element.children.map((child, index) => (
        <RenderedElement key={child.id} element={child} path={`${path}.${index}`} />
      ))}
    </Tag>
  );
}
