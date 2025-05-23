
"use client";

import type { CSSProperties } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EditorElement, DraggableItem, DraggableItemType } from '@/types/editor';
import { AVAILABLE_ELEMENTS } from '@/lib/constants';

interface EditorContextType {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  addElement: (itemType: DraggableItemType, parentId?: string) => void;
  updateElement: (elementId: string, updates: Partial<EditorElement>) => void;
  updateElementStyle: (elementId: string, newStyles: CSSProperties) => void;
  updateElementContent: (elementId: string, content: string) => void; // For elements where content means innerText/value
  updateElementAttribute: (elementId: string, attributeName: string, value: string) => void;
  updateElementName: (elementId: string, name: string) => void;
  selectElement: (elementId: string | null) => void;
  deleteElement: (elementId: string) => void;
  moveElement: (draggedId: string, targetId: string | null, position?: 'before' | 'after' | 'inside') => void; // For future reordering
  setElements: React.Dispatch<React.SetStateAction<EditorElement[]>>; // For direct manipulation like DND
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);

  const findElementRecursive = (elementsArray: EditorElement[], elementId: string): EditorElement | null => {
    for (const el of elementsArray) {
      if (el.id === elementId) return el;
      if (el.children && el.children.length > 0) {
        const found = findElementRecursive(el.children, elementId);
        if (found) return found;
      }
    }
    return null;
  };
  
  const updateElementRecursive = (
    elementsArray: EditorElement[],
    elementId: string,
    updates: Partial<EditorElement>
  ): EditorElement[] => {
    return elementsArray.map(el => {
      if (el.id === elementId) {
        const newEl = { ...el, ...updates };
        if (updates.styles) {
          newEl.styles = { ...el.styles, ...updates.styles };
        }
        if (updates.attributes) {
          newEl.attributes = { ...el.attributes, ...updates.attributes };
        }
        return newEl;
      }
      if (el.children && el.children.length > 0) {
        return { ...el, children: updateElementRecursive(el.children, elementId, updates) };
      }
      return el;
    });
  };

  const deleteElementRecursive = (
    elementsArray: EditorElement[],
    elementId: string
  ): EditorElement[] => {
    return elementsArray.filter(el => {
      if (el.id === elementId) return false;
      if (el.children && el.children.length > 0) {
        el.children = deleteElementRecursive(el.children, elementId);
      }
      return true;
    });
  };

  const addElementToParent = (
    elementsArray: EditorElement[],
    parentId: string,
    newElement: EditorElement
  ): EditorElement[] => {
    return elementsArray.map(el => {
      if (el.id === parentId) {
        const childrenArray = el.children || [];
        return { ...el, children: [...childrenArray, newElement] };
      }
      if (el.children && el.children.length > 0) {
        return { ...el, children: addElementToParent(el.children, parentId, newElement) };
      }
      return el;
    });
  };

  const addElement = useCallback((itemType: DraggableItemType, parentId?: string) => {
    if (itemType === 'card') {
      const cardContainerId = crypto.randomUUID();
      const cardContainer: EditorElement = {
        id: cardContainerId,
        type: 'div',
        name: 'Card Container',
        styles: {
          padding: '1rem',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          width: '300px',
          backgroundColor: 'hsl(var(--card))',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        },
        attributes: {},
        children: [],
      };

      const childTemplates: Array<Partial<EditorElement> & { type: EditorElement['type']}> = [
        { 
          type: 'img', 
          name: 'Card Image',
          attributes: { src: 'https://placehold.co/300x200.png', alt: 'Card image' },
          styles: { width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 'calc(var(--radius) - 4px)' } // inner radius
        },
        { 
          type: 'h3', 
          name: 'Card Title',
          content: 'Card Title',
          styles: { margin: '0', fontSize: '1.25rem', fontWeight: 'bold' }
        },
        { 
          type: 'p', 
          name: 'Card Text',
          content: 'This is some card text content. Describe the item or feature here.',
          styles: { margin: '0', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', lineHeight: '1.5' }
        },
        { 
          type: 'button', 
          name: 'Card Button',
          content: 'Learn More',
          styles: { alignSelf: 'flex-start' } // Use default button styles from constants + this
        },
      ];
      
      cardContainer.children = childTemplates.map(childTemplate => {
        const elDetails = AVAILABLE_ELEMENTS.find(e => e.type === childTemplate.type)!;
        return {
            id: crypto.randomUUID(),
            type: childTemplate.type,
            name: childTemplate.name || `${elDetails.label} (Card)`,
            content: childTemplate.content || elDetails.defaultContent,
            attributes: {...elDetails.defaultAttributes, ...childTemplate.attributes},
            styles: {...elDetails.defaultStyles, ...childTemplate.styles},
            children: []
        };
      });
      
      if (parentId) {
        setElements(prevElements => addElementToParent(prevElements, parentId, cardContainer));
      } else {
        setElements(prevElements => [...prevElements, cardContainer]);
      }
      selectElement(cardContainerId);
      return;
    }


    const itemTemplate = AVAILABLE_ELEMENTS.find(el => el.type === itemType);
    if (!itemTemplate) return;

    const newElement: EditorElement = {
      id: crypto.randomUUID(),
      type: itemTemplate.type as EditorElement['type'], // Cast because itemType can be 'card' here
      name: `${itemTemplate.label} ${Math.floor(Math.random() * 1000)}`,
      content: itemTemplate.defaultContent,
      attributes: itemTemplate.defaultAttributes ? { ...itemTemplate.defaultAttributes } : {},
      styles: itemTemplate.defaultStyles ? { ...itemTemplate.defaultStyles } : {},
      children: [],
    };

    if ((itemTemplate.type === 'ul' || itemTemplate.type === 'ol') && newElement.type !== 'card') { // Ensure newElement.type is not card
      const listItemTemplate = AVAILABLE_ELEMENTS.find(el => el.type === 'li');
      const listItem: EditorElement = {
        id: crypto.randomUUID(),
        type: 'li',
        name: 'List Item',
        content: listItemTemplate?.defaultContent || 'List item',
        attributes: listItemTemplate?.defaultAttributes || {},
        styles: listItemTemplate?.defaultStyles || { marginBottom: '0.25rem' },
        children: [],
      };
      newElement.children.push(listItem);
    }


    if (parentId) {
      const parentElement = findElementRecursive(elements, parentId);
      if (parentElement && (parentElement.type === 'div' || parentElement.type === 'ul' || parentElement.type === 'ol' || (parentElement.type === 'li' && newElement.type !== 'li'))) {
         setElements(prevElements => addElementToParent(prevElements, parentId, newElement));
      } else if (parentElement && parentElement.type === 'li' && newElement.type === 'li') {
         setElements(prevElements => [...prevElements, newElement]);
      } else {
        setElements(prevElements => [...prevElements, newElement]);
      }
    } else {
      setElements(prevElements => [...prevElements, newElement]);
    }
    selectElement(newElement.id);
  }, [elements]); 

  const updateElement = useCallback((elementId: string, updates: Partial<EditorElement>) => {
    setElements(prevElements => updateElementRecursive(prevElements, elementId, updates));
    if (selectedElement?.id === elementId) {
      setSelectedElement(prevSelected => {
        if (!prevSelected) return null;
        const updatedSelected = { ...prevSelected, ...updates };
        if (updates.styles) {
          updatedSelected.styles = { ...prevSelected.styles, ...updates.styles };
        }
        if (updates.attributes) {
          updatedSelected.attributes = { ...prevSelected.attributes, ...updates.attributes };
        }
        return updatedSelected;
      });
    }
  }, [selectedElement?.id]); 
  
  const updateElementStyle = useCallback((elementId: string, newStyles: CSSProperties) => {
    updateElement(elementId, { styles: newStyles });
  }, [updateElement]);

  const updateElementContent = useCallback((elementId: string, content: string) => {
    const element = findElementRecursive(elements, elementId);
    if (element && element.type === 'input') {
       updateElement(elementId, { attributes: { ...element.attributes, value: content } });
    } else {
       updateElement(elementId, { content });
    }
  }, [updateElement, elements]);

  const updateElementAttribute = useCallback((elementId: string, attributeName: string, value: string) => {
    const currentElement = findElementRecursive(elements, elementId);
    if (currentElement) {
      const newAttributes = { ...currentElement.attributes, [attributeName]: value };
      updateElement(elementId, { attributes: newAttributes });
    }
  }, [updateElement, elements]);


  const updateElementName = useCallback((elementId: string, name: string) => {
    updateElement(elementId, { name });
  }, [updateElement]);

  const selectElement = useCallback((elementId: string | null) => {
    if (elementId === null) {
      setSelectedElement(null);
    } else {
      const foundElement = findElementRecursive(elements, elementId);
      setSelectedElement(foundElement);
    }
  }, [elements]);

  const deleteElement = useCallback((elementId: string) => {
    setElements(prevElements => deleteElementRecursive(prevElements, elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement?.id]);

  const moveElement = useCallback((draggedId: string, targetId: string | null, position?: 'before' | 'after' | 'inside') => {
    console.log("Move element:", draggedId, targetId, position);
    // Placeholder for DND reordering logic - This needs a robust implementation
    // For example, removing the element and re-inserting it at the new position
    // Needs to handle hierarchical structures correctly.
  }, []);


  return (
    <EditorContext.Provider
      value={{
        elements,
        selectedElement,
        addElement,
        updateElement,
        updateElementStyle,
        updateElementContent,
        updateElementAttribute,
        updateElementName,
        selectElement,
        deleteElement,
        moveElement,
        setElements,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
