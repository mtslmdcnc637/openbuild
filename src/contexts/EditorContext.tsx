
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
        // Ensure children array exists
        const childrenArray = el.children || [];
        return { ...el, children: [...childrenArray, newElement] };
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
      name: `${itemTemplate.label} ${Math.floor(Math.random() * 1000)}`,
      content: itemTemplate.defaultContent,
      attributes: itemTemplate.defaultAttributes ? { ...itemTemplate.defaultAttributes } : {},
      styles: itemTemplate.defaultStyles ? { ...itemTemplate.defaultStyles } : {},
      children: [], // Initialize children as empty array
    };

    if (itemTemplate.type === 'ul' || itemTemplate.type === 'ol') {
      const listItem: EditorElement = {
        id: crypto.randomUUID(),
        type: 'li',
        name: 'List Item',
        content: 'List item',
        attributes: {},
        styles: { marginBottom: '0.25rem' },
        children: [],
      };
      newElement.children.push(listItem);
    }


    if (parentId) {
      const parentElement = findElementRecursive(elements, parentId);
      if (parentElement && (parentElement.type === 'div' || parentElement.type === 'ul' || parentElement.type === 'ol' || (parentElement.type === 'li' && newElement.type !== 'li'))) { // Added more checks
         setElements(prevElements => addElementToParent(prevElements, parentId, newElement));
      } else if (parentElement && parentElement.type === 'li' && newElement.type === 'li') {
        // If trying to add 'li' to 'li', add to parent 'ul'/'ol' instead (complex, needs parent traversal or different strategy)
        // For now, disallow or add to root if parent is 'li' and new item is 'li'
         setElements(prevElements => [...prevElements, newElement]);
      } else {
        // If parent is not a valid container, add to root
        setElements(prevElements => [...prevElements, newElement]);
      }
    } else {
      setElements(prevElements => [...prevElements, newElement]);
    }
    selectElement(newElement.id);
  }, [elements]); // Added elements to dependency array

  const updateElement = useCallback((elementId: string, updates: Partial<EditorElement>) => {
    setElements(prevElements => updateElementRecursive(prevElements, elementId, updates));
    // Update selectedElement state if it's the one being modified
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
  }, [selectedElement?.id]); // Removed elements from dep array as it's already in setElements
  
  const updateElementStyle = useCallback((elementId: string, newStyles: CSSProperties) => {
    updateElement(elementId, { styles: newStyles });
  }, [updateElement]);

  const updateElementContent = useCallback((elementId: string, content: string) => {
    // For textarea, content is its value. For input type text, attribute 'value' is preferred.
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
