
"use client";

import type { CSSProperties, DragEvent, ChangeEvent } from 'react';
import React from 'react';
import type { EditorElement } from '@/types/editor';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { getComputedStyles } from '@/lib/style-utils'; // Import the new helper

interface RenderedElementProps {
  element: EditorElement;
  path: string;
}

export function RenderedElement({ element, path }: RenderedElementProps) {
  const { selectElement, selectedElement, addElement, moveElement, updateElementContent, updateElementAttribute, viewportMode } = useEditor();

  const isSelected = selectedElement?.id === element.id;
  const computedStyles = getComputedStyles(element.styles, viewportMode); // Compute styles based on viewport

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
    style: computedStyles, // Use computed styles
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
  
  if (['div', 'ul', 'ol', 'li'].includes(element.type)) {
    commonProps.onDragOver = handleDragOver;
    commonProps.onDragLeave = handleDragLeave;
    commonProps.onDrop = handleDrop;
  }

  if (element.type === 'img') {
    const imgStyles = { ...computedStyles }; // Use computed styles
    const imageWidth = parseInt(String(imgStyles.width) || '100', 10);
    const imageHeight = parseInt(String(imgStyles.height) || '100', 10);
    // next/image handles width & height via props, so remove them from inline style for the wrapper div
    // if they are meant for the image itself.
    // For objectFit, it's better to apply it directly to the Image component style prop.
    const wrapperSpecificStyles: CSSProperties = { ...imgStyles };
    delete wrapperSpecificStyles.width;
    delete wrapperSpecificStyles.height;
    delete wrapperSpecificStyles.objectFit;


    return (
      <div 
        {...commonProps}
        style={{ display: 'inline-block', ...wrapperSpecificStyles }} // Apply remaining styles to wrapper
      >
        <Image
          src={element.attributes?.src || 'https://placehold.co/100x100.png'}
          alt={element.attributes?.alt || 'Imagem'}
          width={imageWidth || 100} // Use parsed width or default
          height={imageHeight || 100} // Use parsed height or default
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

    const wrapperStyles = {
      ...computedStyles, // Use computed styles
      display: computedStyles.display || 'inline-flex',
      alignItems: computedStyles.alignItems || 'center',
      justifyContent: computedStyles.justifyContent || 'center',
    };
    
    const { color, ...restCommonStyles } = commonProps.style || {};

    return (
      <div 
        {...commonProps}
        style={wrapperStyles}
      >
        <IconComponent
          size={numSize}
          color={computedStyles.color as string || 'currentColor'}
          strokeWidth={numStrokeWidth}
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

  // For non-void elements, pass down children
  if (React.createElement(Tag).props.children !== undefined && element.children && element.children.length > 0) {
    return React.createElement(
      Tag,
      { ...commonProps, ...element.attributes },
      element.content,
      element.children.map((child, index) => (
        <RenderedElement key={child.id} element={child} path={`${path}.${index}`} />
      ))
    );
  }
  
  // For void elements or elements without children property in JSX, or no children in data
  return React.createElement(
    Tag,
    { ...commonProps, ...element.attributes },
    element.content
  );
}
