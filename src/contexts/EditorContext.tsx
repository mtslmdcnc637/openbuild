"use client";

import type { CSSProperties } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EditorElement, DraggableItem } from '@/types/editor';
import { AVAILABLE_ELEMENTS } from '@/lib/constants';

interface EditorContextType {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  addElement: (itemType: DraggableItem['type'], parentId?: string) => void;
  updateElement: (elementId: string, updates: Partial<EditorElement>) => void;
  updateElementStyle: (elementId: string, newStyles: CSSProperties) => void;
  updateElementContent: (elementId: string, content: string) => void;
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
        return { ...el, ...updates, styles: { ...el.styles, ...updates.styles } };
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
        return { ...el, children: [...el.children, newElement] };
      }
      if (el.children && el.children.length > 0) {
        return { ...el, children: addElementToParent(el.children, parentId, newElement) };
      }
      return el;
    });
  };

  const addElement = useCallback((itemType: DraggableItem['type'], parentId?: string) => {
    const itemTemplate = AVAILABLE_ELEMENTS.find(el => el.type === itemType);
    if (!itemTemplate) return;

    const newElement: EditorElement = {
      id: crypto.randomUUID(),
      type: itemTemplate.type,
      name: `${itemTemplate.label} ${Math.floor(Math.random() * 1000)}`, // Simple unique name
      content: itemTemplate.defaultContent,
      attributes: itemTemplate.defaultAttributes ? { ...itemTemplate.defaultAttributes } : {},
      styles: itemTemplate.defaultStyles ? { ...itemTemplate.defaultStyles } : {},
      children: [],
    };

    if (parentId) {
      setElements(prevElements => addElementToParent(prevElements, parentId, newElement));
    } else {
      setElements(prevElements => [...prevElements, newElement]);
    }
    selectElement(newElement.id);
  }, []);

  const updateElement = useCallback((elementId: string, updates: Partial<EditorElement>) => {
    setElements(prevElements => updateElementRecursive(prevElements, elementId, updates));
    if (selectedElement?.id === elementId) {
       const currentSelected = findElementRecursive(elements, elementId);
       if (currentSelected) {
         setSelectedElement({ ...currentSelected, ...updates, styles: { ...currentSelected.styles, ...updates.styles } });
       }
    }
  }, [elements, selectedElement?.id]);
  
  const updateElementStyle = useCallback((elementId: string, newStyles: CSSProperties) => {
    updateElement(elementId, { styles: newStyles });
  }, [updateElement]);

  const updateElementContent = useCallback((elementId: string, content: string) => {
    updateElement(elementId, { content });
  }, [updateElement]);

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

  // Placeholder for future drag-and-drop reordering logic
  const moveElement = useCallback((draggedId: string, targetId: string | null, position?: 'before' | 'after' | 'inside') => {
    // Complex logic for reordering elements, including nesting.
    // This would involve finding the dragged element, removing it from its current position,
    // and inserting it at the new position relative to the target.
    console.log("Move element:", draggedId, targetId, position);
    // For now, this is a no-op. Full DND reordering is complex.
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
