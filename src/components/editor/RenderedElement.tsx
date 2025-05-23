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
    // You can add visual feedback here, like a border
    if (element.type === 'div') { // Only divs can be drop targets for now
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
    if (element.type === 'div') {
        e.currentTarget.classList.remove('drag-over-active');
    }

    const itemDataString = e.dataTransfer.getData('application/json');
    if (!itemDataString) return;
    const item = JSON.parse(itemDataString);

    // Check if dropping an existing element (for reordering) or a new one
    if (item.id) { // Assuming existing elements have an 'id' property when dragged
        moveElement(item.id, element.id, 'inside');
    } else if (item.type && element.type === 'div') { // Dropping a new element from the panel
        addElement(item.type, element.id); // Add as child to this div
    }
  };

  const Tag = element.type as keyof JSX.IntrinsicElements;
  
  const renderContent = () => {
    if (element.type === 'img') {
      return (
        <Image
          src={element.attributes?.src || 'https://placehold.co/100x100.png'}
          alt={element.attributes?.alt || 'Image'}
          width={parseInt(element.styles.width?.toString() || '100')}
          height={parseInt(element.styles.height?.toString() || '100')}
          style={{ objectFit: element.styles.objectFit as CSSProperties['objectFit'] || 'cover' }}
          data-ai-hint={element.attributes?.src?.includes('placehold.co') ? "abstract placeholder" : ""}
          draggable={false} // Prevent native image drag
        />
      );
    }
    return element.content;
  };

  return (
    <Tag
      style={element.styles}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'outline-offset-2 transition-all duration-100 ease-in-out',
        isSelected ? 'outline outline-2 outline-accent ring-2 ring-accent' : 'outline outline-1 outline-transparent hover:outline-blue-300',
        element.type === 'div' && 'min-h-[50px]' // ensure divs are droppable
      )}
      data-element-id={element.id}
      data-element-type={element.type}
      // Spread other attributes for tags like <img>
      {...(element.type === 'img' ? {} : element.attributes)} // Avoid spreading src/alt for non-img from main attributes for now
    >
      {renderContent()}
      {element.type !== 'img' && element.children && element.children.map((child, index) => (
        <RenderedElement key={child.id} element={child} path={`${path}.${index}`} />
      ))}
    </Tag>
  );
}
