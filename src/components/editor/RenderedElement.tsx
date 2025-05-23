
"use client";

import type { CSSProperties, DragEvent, ChangeEvent } from 'react';
import React from 'react';
import type { EditorElement } from '@/types/editor';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { getComputedStyles } from '@/lib/style-utils';

interface RenderedElementProps {
  element: EditorElement;
  path: string;
}

export function RenderedElement({ element, path }: RenderedElementProps) {
  const { selectElement, selectedElement, addElement, moveElement, updateElementContent, updateElementAttribute, viewportMode } = useEditor();

  const isSelected = selectedElement?.id === element.id;
  const computedStyles = getComputedStyles(element.styles, viewportMode);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (['div', 'ul', 'ol', 'li'].includes(element.type)) {
        e.currentTarget.classList.add('drag-over-active');
    } else {
        e.dataTransfer.dropEffect = "none";
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
      return;
    }
    e.currentTarget.classList.remove('drag-over-active');
    
    const itemDataString = e.dataTransfer.getData('application/json');
    if (!itemDataString) return;
    const item = JSON.parse(itemDataString);

    if (item.id) { 
        moveElement(item.id, element.id, 'inside');
    } else if (item.type) { 
        if (item.type === 'li' && !['ul', 'ol'].includes(element.type)) {
            return;
        }
        addElement(item.type, element.id);
    }
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (element.type === 'input') {
      updateElementAttribute(element.id, 'value', e.target.value);
    } else if (element.type === 'textarea') {
      updateElementContent(element.id, e.target.value);
    }
  };

  const commonProps: React.HTMLAttributes<HTMLElement> & { style?: CSSProperties } = {
    style: computedStyles,
    onClick: handleClick,
    className: cn(
      'outline-offset-2 transition-all duration-100 ease-in-out relative hover:cursor-pointer', 
      isSelected ? 'outline outline-2 outline-accent ring-2 ring-accent' : 'outline outline-1 outline-transparent hover:outline-blue-300',
      ['div', 'ul', 'ol', 'li'].includes(element.type) && 'min-h-[50px] border-dashed border-transparent',
      ['div', 'ul', 'ol', 'li'].includes(element.type) && 'drag-over-active:border-accent drag-over-active:bg-accent/10'
    ),
    'data-element-id': element.id,
    'data-element-type': element.type,
  };
  
  if (['div', 'ul', 'ol', 'li'].includes(element.type)) {
    commonProps.onDragOver = handleDragOver;
    commonProps.onDragLeave = handleDragLeave;
    commonProps.onDrop = handleDrop;
  }

  if (element.type === 'img') {
    const imgStyles = { ...computedStyles }; 
    const imageWidth = parseInt(String(imgStyles.width) || '100', 10);
    const imageHeight = parseInt(String(imgStyles.height) || '100', 10);
    
    const wrapperSpecificStyles: CSSProperties = { ...imgStyles };
    delete wrapperSpecificStyles.width;
    delete wrapperSpecificStyles.height;
    delete wrapperSpecificStyles.objectFit;


    // For img, the commonProps (like click and outline) should be on a wrapper div.
    // The next/image itself shouldn't have these interactive props directly if we want styling on the wrapper.
    return (
      <div 
        style={{ display: computedStyles.display || 'inline-block', ...wrapperSpecificStyles }} // Apply remaining styles to wrapper
        onClick={handleClick} // Click on wrapper for selection
        className={cn(
          'outline-offset-2 transition-all duration-100 ease-in-out relative hover:cursor-pointer',
          isSelected ? 'outline outline-2 outline-accent ring-2 ring-accent' : 'outline outline-1 outline-transparent hover:outline-blue-300'
        )}
        data-element-id={element.id} // Ensure ID is on the clickable wrapper
        data-element-type={element.type}
      >
        <Image
          src={element.attributes?.src || 'https://placehold.co/100x100.png'}
          alt={element.attributes?.alt || 'Imagem'}
          width={imageWidth || 100} 
          height={imageHeight || 100} 
          style={{ objectFit: computedStyles.objectFit as CSSProperties['objectFit'] || 'cover' }}
          data-ai-hint={element.attributes?.src?.includes('placehold.co') ? "abstract placeholder" : ""}
          draggable={false}
        />
      </div>
    );
  }

  if (element.type === 'icon') {
    const { iconName = 'Smile', size = '24', strokeWidth = '2' } = element.attributes || {};
    const validIconName = typeof iconName === 'string' ? iconName : 'Smile';
    const IconComponent = (LucideIcons as any)[validIconName] || LucideIcons.AlertTriangle;

    const numSize = parseInt(size as string, 10) || 24;
    const numStrokeWidth = parseFloat(strokeWidth as string) || 2;

    // For icon, the commonProps (like click and outline) should be on a wrapper div.
    const wrapperStyles = {
      ...computedStyles,
      display: computedStyles.display || 'inline-flex',
      alignItems: computedStyles.alignItems || 'center',
      justifyContent: computedStyles.justifyContent || 'center',
      // Remove color from wrapper if it's meant for the icon itself
    };
    delete wrapperStyles.color;


    return (
      <div 
        {...commonProps} // Apply common interactive props and outlines to the wrapper
        style={wrapperStyles} // Wrapper styles without icon-specific color
      >
        <IconComponent
          size={numSize}
          color={computedStyles.color as string || 'currentColor'} // Icon gets its color from computedStyles
          strokeWidth={numStrokeWidth}
          draggable={false}
        />
      </div>
    );
  }

  // Void elements don't have children or content in the same way
  if (element.type === 'hr') {
    // HR doesn't have content or children in the typical sense.
    // We pass commonProps for styling, selection, etc.
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

  // Textarea is not a void element, it takes content between its tags
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

  // For non-void elements that can have children
  if (element.children && element.children.length > 0) {
    return React.createElement(
      Tag,
      { ...commonProps, ...element.attributes },
      element.content, // Render direct content if any
      element.children.map((child, index) => (
        <RenderedElement key={child.id} element={child} path={`${path}.${index}`} />
      ))
    );
  }
  
  // For non-void elements without children (but might have content)
  // or elements that are technically not void but don't typically have React children in this editor model (e.g., p, h1, button)
  return React.createElement(
    Tag,
    { ...commonProps, ...element.attributes },
    element.content // Render content for p, h1, button, span etc.
  );
}
