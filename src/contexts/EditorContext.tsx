
"use client";

import type { CSSProperties } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EditorElement, DraggableItemType, ViewportMode } from '@/types/editor';
import { AVAILABLE_ELEMENTS } from '@/lib/constants';

interface EditorContextType {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  viewportMode: ViewportMode;
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
  setViewportMode: (mode: ViewportMode) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');

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
          // TODO: When implementing responsive styles, this will need to update the correct breakpoint.
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
          attributes: { src: 'https://placehold.co/300x200.png', alt: 'Card image', 'data-ai-hint': 'placeholder modern' },
          styles: { width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 'calc(var(--radius) - 4px)' }
        },
        { 
          type: 'h3', 
          name: 'Card Title',
          content: 'Título do Card',
          styles: { margin: '0', fontSize: '1.25rem', fontWeight: 'bold' }
        },
        { 
          type: 'p', 
          name: 'Card Text',
          content: 'Este é o texto do card. Descreva o item ou recurso aqui.',
          styles: { margin: '0', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', lineHeight: '1.5' }
        },
        { 
          type: 'button', 
          name: 'Card Button',
          content: 'Saiba Mais',
          styles: { 
            alignSelf: 'flex-start',
            // Copiando estilos de botão padrão para consistência inicial
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }
        },
      ];
      
      cardContainer.children = childTemplates.map(childTemplate => {
        const elDetails = AVAILABLE_ELEMENTS.find(e => e.type === childTemplate.type);
        if (!elDetails) {
          console.error(`Detalhes do elemento não encontrados para o tipo: ${childTemplate.type}`);
          return null; 
        }
        return {
            id: crypto.randomUUID(),
            type: childTemplate.type,
            name: childTemplate.name || `${elDetails.label} (Card)`,
            content: childTemplate.content || elDetails.defaultContent,
            attributes: {...(elDetails.defaultAttributes || {}), ...(childTemplate.attributes || {})},
            styles: {...(elDetails.defaultStyles || {}), ...(childTemplate.styles || {})}, 
            children: []
        };
      }).filter(Boolean) as EditorElement[]; 
      
      if (parentId) {
        setElements(prevElements => addElementToParent(prevElements, parentId, cardContainer));
      } else {
        setElements(prevElements => [...prevElements, cardContainer]);
      }
      selectElement(cardContainerId);
      return;
    } else if (itemType === 'section-columns') {
      const rowId = crypto.randomUUID();
      const column1Id = crypto.randomUUID();
      const column2Id = crypto.randomUUID();

      const columnElementDefaultStyles: CSSProperties = {
        flex: '1', // Cada coluna ocupa espaço igual
        minHeight: '100px', // Para facilitar o drop
        padding: '1rem', // Espaçamento interno da coluna
        border: '1px dashed hsl(var(--muted))', // Visualização no editor
        display: 'flex', // Para alinhar itens dentro da coluna (opcional)
        flexDirection: 'column', // Itens dentro da coluna empilham verticalmente
        gap: '0.5rem', // Espaço entre elementos dentro da coluna
      };

      const newRowElement: EditorElement = {
        id: rowId,
        type: 'div', // A linha é um div
        name: 'Linha de Colunas',
        styles: {
          display: 'flex', // Ativa o layout flexbox para as colunas
          width: '100%', // A linha ocupa toda a largura disponível
          gap: '1rem', // Espaço entre as colunas
          padding: '0.5rem', // Espaçamento interno da linha
          border: '1px dashed hsl(var(--border))', // Visualização no editor
          minHeight: '120px', // Para facilitar a seleção da linha
        },
        attributes: {},
        children: [
          {
            id: column1Id,
            type: 'div',
            name: 'Coluna 1',
            styles: { ...columnElementDefaultStyles },
            attributes: {},
            children: [],
          },
          {
            id: column2Id,
            type: 'div',
            name: 'Coluna 2',
            styles: { ...columnElementDefaultStyles },
            attributes: {},
            children: [],
          },
        ],
      };

      if (parentId) {
        setElements(prevElements => addElementToParent(prevElements, parentId, newRowElement));
      } else {
        setElements(prevElements => [...prevElements, newRowElement]);
      }
      selectElement(rowId); // Seleciona a linha principal recém-criada
      return;
    }


    const itemTemplate = AVAILABLE_ELEMENTS.find(el => el.type === itemType);
    if (!itemTemplate) return;

    const newElement: EditorElement = {
      id: crypto.randomUUID(),
      type: itemTemplate.type as EditorElement['type'],
      name: `${itemTemplate.label} ${Math.floor(Math.random() * 1000)}`,
      content: itemTemplate.defaultContent,
      attributes: itemTemplate.defaultAttributes ? { ...itemTemplate.defaultAttributes } : {},
      styles: itemTemplate.defaultStyles ? { ...itemTemplate.defaultStyles } : {},
      children: [],
    };

    if ((itemTemplate.type === 'ul' || itemTemplate.type === 'ol') && newElement.type !== 'card' && newElement.type !== 'section-columns') {
      const listItemTemplate = AVAILABLE_ELEMENTS.find(el => el.type === 'li');
      const listItem: EditorElement = {
        id: crypto.randomUUID(),
        type: 'li',
        name: 'Item da Lista',
        content: listItemTemplate?.defaultContent || 'Item da lista',
        attributes: listItemTemplate?.defaultAttributes || {},
        styles: listItemTemplate?.defaultStyles || { marginBottom: '0.25rem' },
        children: [],
      };
      newElement.children.push(listItem);
    }


    if (parentId) {
      const parentElement = findElementRecursive(elements, parentId);
      // Permite adicionar a qualquer 'div', 'ul', 'ol'. 'li' só aceita 'li' se for o pai direto (listas aninhadas).
      const canAcceptChild = parentElement && 
                             (parentElement.type === 'div' || 
                              parentElement.type === 'ul' || 
                              parentElement.type === 'ol' ||
                              (parentElement.type === 'li' && newElement.type !== 'li')); // Um 'li' não pode ser pai direto de outro 'li' na mesma lista, mas pode ser pai de um 'div' ou 'p' etc.


      if (canAcceptChild) {
         setElements(prevElements => addElementToParent(prevElements, parentId, newElement));
      } else if (parentElement && parentElement.type === 'li' && newElement.type === 'li') {
         // Lógica para encontrar o UL/OL pai do LI pai, e adicionar o novo LI a esse UL/OL
         // Esta é uma simplificação, idealmente encontraríamos o UL/OL pai do LI.
         // Por agora, se não puder adicionar ao LI, adiciona ao root ou ao primeiro container válido.
         console.warn("Tentando adicionar LI a outro LI. Buscando UL/OL pai ou adicionando ao root.");
         // Tenta adicionar ao root como fallback
         setElements(prevElements => [...prevElements, newElement]);
      } else {
        // Fallback para adicionar ao root se o pai não for um container válido para este filho
        setElements(prevElements => [...prevElements, newElement]);
      }
    } else {
      // Adiciona ao root se não houver parentId
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
    // console.log("Move element:", draggedId, targetId, position);
    // Placeholder
  }, []);


  return (
    <EditorContext.Provider
      value={{
        elements,
        selectedElement,
        viewportMode,
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
        setViewportMode,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor deve ser usado dentro de um EditorProvider');
  }
  return context;
};
