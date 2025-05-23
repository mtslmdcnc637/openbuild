
"use client";

import type { CSSProperties, DragEvent, ChangeEvent } from 'react';
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
  const { selectElement, selectedElement, addElement, moveElement, updateElementContent, updateElementAttribute } = useEditor();

  const isSelected = selectedElement?.id === element.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only allow dropping on elements that can accept children
    if (['div', 'ul', 'ol', 'li'].includes(element.type)) {
        e.currentTarget.classList.add('drag-over-active');
    } else {
        e.dataTransfer.dropEffect = "none"; // Indicate not a valid drop target
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.stopPropagation();
    if (['div', 'ul', 'ol', 'li'].includes(element.type)) {
        e.currentTarget.classList.remove('drag-over-active');
    }
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
     if (!['div', 'ul', 'ol', 'li'].includes(element.type)) {
      return; // Don't allow dropping on non-container types
    }
    e.currentTarget.classList.remove('drag-over-active');
    
    const itemDataString = e.dataTransfer.getData('application/json');
    if (!itemDataString) return;
    const item = JSON.parse(itemDataString);

    if (item.id) { 
        moveElement(item.id, element.id, 'inside');
    } else if (item.type) { 
        // Special handling for li: only allow li inside ul or ol
        if (item.type === 'li' && !['ul', 'ol'].includes(element.type)) {
            // console.warn("Cannot drop 'li' directly into non-list element. Try dropping into UL or OL.");
            return;
        }
        addElement(item.type, element.id);
    }
  };
  
  // Handle input/textarea changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (element.type === 'input') {
      updateElementAttribute(element.id, 'value', e.target.value);
    } else if (element.type === 'textarea') {
      updateElementContent(element.id, e.target.value);
    }
  };


  // Common props for the wrapper/main element
  const commonProps = {
    style: element.styles,
    onClick: handleClick,
    className: cn(
      'outline-offset-2 transition-all duration-100 ease-in-out relative', // Added relative for potential absolute children/badges
      isSelected ? 'outline outline-2 outline-accent ring-2 ring-accent' : 'outline outline-1 outline-transparent hover:outline-blue-300',
      // Apply consistent drag-over styles for droppable containers
      ['div', 'ul', 'ol', 'li'].includes(element.type) && 'min-h-[50px] border-dashed border-transparent',
      ['div', 'ul', 'ol', 'li'].includes(element.type) && 'drag-over-active:border-accent drag-over-active:bg-accent/10'
    ),
    'data-element-id': element.id,
    'data-element-type': element.type,
    onDragOver: ['div', 'ul', 'ol', 'li'].includes(element.type) ? handleDragOver : undefined,
    onDragLeave: ['div', 'ul', 'ol', 'li'].includes(element.type) ? handleDragLeave : undefined,
    onDrop: ['div', 'ul', 'ol', 'li'].includes(element.type) ? handleDrop : undefined,
  };


  if (element.type === 'img') {
    const imgStyles = { ...element.styles };
    // next/image handles width/height via props, not style for layout, but objectFit can be in style
    const imageWidth = parseInt(String(imgStyles.width) || '100', 10);
    const imageHeight = parseInt(String(imgStyles.height) || '100', 10);
    // remove from style object passed to wrapper div, as next/image uses props.
    delete imgStyles.width;
    delete imgStyles.height;

    return (
      <div // Wrapper for selection, click events, and layout styles (margin, etc.)
        {...commonProps}
        style={{ display: 'inline-block', ...imgStyles }} // ensure wrapper takes only necessary space and other styles
        onDragOver={undefined} // Images are not drop targets
        onDragLeave={undefined}
        onDrop={undefined}
      >
        <Image
          src={element.attributes?.src || 'https://placehold.co/100x100.png'}
          alt={element.attributes?.alt || 'Image'}
          width={imageWidth || 100}
          height={imageHeight || 100}
          style={{ objectFit: element.styles.objectFit as CSSProperties['objectFit'] || 'cover' }}
          data-ai-hint={element.attributes?.src?.includes('placehold.co') ? "abstract placeholder" : ""}
          draggable={false}
        />
      </div>
    );
  }

  if (element.type === 'hr') {
    return <hr {...commonProps} {...element.attributes} />;
  }
  
  if (element.type === 'input') {
    const { children, content, ...tagSpecificAttributes } = element.attributes || {};
    return (
        <input
            {...commonProps}
            {...tagSpecificAttributes}
            type={element.attributes?.type as string || 'text'}
            placeholder={element.attributes?.placeholder as string || ''}
            value={element.attributes?.value as string || ''}
            onChange={handleInputChange}
            // Inputs are not drop targets generally
            onDragOver={undefined}
            onDragLeave={undefined}
            onDrop={undefined}
        />
    );
  }

  if (element.type === 'textarea') {
     const { children, ...tagSpecificAttributes } = element.attributes || {};
    return (
        <textarea
            {...commonProps}
            {...tagSpecificAttributes}
            placeholder={element.attributes?.placeholder as string || ''}
            value={element.content || ''} // Textarea value from content
            onChange={handleInputChange}
            // Textareas are not drop targets
            onDragOver={undefined}
            onDragLeave={undefined}
            onDrop={undefined}
        />
    );
  }
  
  // For label, use htmlFor attribute
  if (element.type === 'label') {
    const { htmlFor, ...otherAttrs } = element.attributes || {};
    return (
      <label
        {...commonProps}
        htmlFor={htmlFor as string || undefined}
        {...otherAttrs}
        // Labels are not typically drop targets themselves
        onDragOver={undefined}
        onDragLeave={undefined}
        onDrop={undefined}
      >
        {element.content}
        {/* Labels typically don't have complex children in this editor context */}
      </label>
    );
  }


  const Tag = element.type as keyof JSX.IntrinsicElements;

  // Default rendering for other elements (div, p, h1, button, span, ul, ol, li, a)
  return (
    <Tag
      {...commonProps}
      {...element.attributes} // Spread other attributes like href for 'a'
    >
      {element.content /* Render text content directly */}
      {element.children && element.children.map((child, index) => (
        <RenderedElement key={child.id} element={child} path={`${path}.${index}`} />
      ))}
    </Tag>
  );
}
