
"use client";

import type { CSSProperties, DragEvent, ChangeEvent } from 'react';
import React from 'react';
import type { EditorElement } from '@/types/editor';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react'; // Import all for dynamic access

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
  const commonProps: React.HTMLAttributes<HTMLElement> & { style?: CSSProperties } = {
    style: element.styles,
    onClick: handleClick,
    className: cn(
      'outline-offset-2 transition-all duration-100 ease-in-out relative', 
      isSelected ? 'outline outline-2 outline-accent ring-2 ring-accent' : 'outline outline-1 outline-transparent hover:outline-blue-300',
      ['div', 'ul', 'ol', 'li'].includes(element.type) && 'min-h-[50px] border-dashed border-transparent',
      ['div', 'ul', 'ol', 'li'].includes(element.type) && 'drag-over-active:border-accent drag-over-active:bg-accent/10'
    ),
    'data-element-id': element.id,
    'data-element-type': element.type,
  };
  
  // Assign drag handlers only to droppable elements
  if (['div', 'ul', 'ol', 'li'].includes(element.type)) {
    commonProps.onDragOver = handleDragOver;
    commonProps.onDragLeave = handleDragLeave;
    commonProps.onDrop = handleDrop;
  }


  if (element.type === 'img') {
    const imgStyles = { ...element.styles };
    const imageWidth = parseInt(String(imgStyles.width) || '100', 10);
    const imageHeight = parseInt(String(imgStyles.height) || '100', 10);
    delete imgStyles.width;
    delete imgStyles.height;

    return (
      <div 
        {...commonProps}
        style={{ display: 'inline-block', ...imgStyles }} 
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

  if (element.type === 'icon') {
    const { iconName = 'Smile', size = '24', strokeWidth = '2' } = element.attributes || {};
    // Ensure iconName is a string and a valid key in LucideIcons
    const validIconName = typeof iconName === 'string' ? iconName : 'Smile';
    const IconComponent = (LucideIcons as any)[validIconName] || LucideIcons.AlertTriangle; // Fallback to AlertTriangle if name is invalid

    const numSize = parseInt(size as string, 10) || 24;
    const numStrokeWidth = parseFloat(strokeWidth as string) || 2;

    // Combine element.styles with default display for wrapper
    const wrapperStyles = {
      ...element.styles,
      display: element.styles.display || 'inline-flex', // Default to inline-flex if not specified
      alignItems: element.styles.alignItems || 'center',
      justifyContent: element.styles.justifyContent || 'center',
    };
    
    // Remove specific icon-related style props from commonProps if they exist to avoid conflicts
    const { color, ...restCommonStyles } = commonProps.style || {};


    return (
      <div 
        {...commonProps}
        style={wrapperStyles} // Use combined styles for the wrapper
      >
        <IconComponent
          size={numSize}
          color={element.styles.color as string || 'currentColor'}
          strokeWidth={numStrokeWidth}
          draggable={false} // Icons themselves are not draggable in this context
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
            value={element.content || ''} 
            onChange={handleInputChange}
        />
    );
  }
  
  if (element.type === 'label') {
    const { htmlFor, ...otherAttrs } = element.attributes || {};
    return (
      <label
        {...commonProps}
        htmlFor={htmlFor as string || undefined}
        {...otherAttrs}
      >
        {element.content}
      </label>
    );
  }

  const Tag = element.type as keyof JSX.IntrinsicElements;

  return React.createElement(
    Tag,
    { ...commonProps, ...element.attributes },
    element.content,
    element.children && element.children.map((child, index) => (
      <RenderedElement key={child.id} element={child} path={`${path}.${index}`} />
    ))
  );
}
