
"use client";

import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EditorElement, DraggableItemType, ViewportMode, ResponsiveStyles, PageSettings, EditorContextType } from '@/types/editor';
import { AVAILABLE_ELEMENTS } from '@/lib/constants';

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const initialPageSettings: PageSettings = {
  pageTitle: 'Minha Página Incrível',
  bodyBackgroundColor: '#FFFFFF', // Default white
  bodyBackgroundImageUrl: '',
  facebookPixelId: '',
  tiktokPixelId: '',
  googleTagManagerId: '',
};

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [viewportMode, setViewportModeInternal] = useState<ViewportMode>('desktop');
  const [pageSettings, setPageSettingsState] = useState<PageSettings>(initialPageSettings); // Renamed to avoid conflict
  const [isCanvasFullScreen, setIsCanvasFullScreen] = useState<boolean>(false);

  const setViewportMode = (mode: ViewportMode) => {
    setViewportModeInternal(mode);
  };

  const updatePageSetting = useCallback(<K extends keyof PageSettings>(settingName: K, value: PageSettings[K]) => {
    setPageSettingsState(prevSettings => ({ // Use setPageSettingsState
      ...prevSettings,
      [settingName]: value,
    }));
  }, []);

  const toggleCanvasFullScreen = useCallback(() => {
    setIsCanvasFullScreen(prev => !prev);
  }, []);


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
          newEl.styles = { ...el.styles, ...updates.styles } as ResponsiveStyles;
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
    const baseId = crypto.randomUUID();
    let newElementToAdd: EditorElement | null = null;

    if (itemType === 'card') {
      const cardContainer: EditorElement = {
        id: baseId,
        type: 'div',
        name: 'Contêiner do Card',
        styles: {
          desktop: {
            padding: '1rem',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            width: '300px',
            backgroundColor: 'hsl(var(--card))',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }
        },
        attributes: {},
        children: [],
      };

      const childTemplates: Array<Partial<EditorElement> & { type: EditorElement['type']}> = [
        {
          type: 'img',
          name: 'Imagem do Card',
          attributes: { src: 'https://placehold.co/300x200.png', alt: 'Imagem do card', 'data-ai-hint': 'modern placeholder' },
          styles: { desktop: { width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 'calc(var(--radius) - 4px)' } }
        },
        {
          type: 'h3',
          name: 'Título do Card',
          content: 'Título do Card',
          styles: { desktop: { margin: '0', fontSize: '1.25rem', fontWeight: 'bold' } }
        },
        {
          type: 'p',
          name: 'Texto do Card',
          content: 'Este é o texto do card. Descreva o item ou recurso aqui.',
          styles: { desktop: { margin: '0', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', lineHeight: '1.5' } }
        },
        {
          type: 'button',
          name: 'Botão do Card',
          content: 'Saiba Mais',
          styles: {
            desktop: {
              alignSelf: 'flex-start',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
            }
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
            attributes: childTemplate.attributes ? {...(elDetails.defaultAttributes || {}), ...childTemplate.attributes} : {...(elDetails.defaultAttributes || {})},
            styles: childTemplate.styles ? childTemplate.styles as ResponsiveStyles : { desktop: elDetails.defaultStyles || {} },
            children: []
        };
      }).filter(Boolean) as EditorElement[];
      newElementToAdd = cardContainer;

    } else if (itemType === 'section-columns') {
      const columnElementDefaultStyles: CSSProperties = {
        flex: '1',
        minHeight: '100px',
        padding: '1rem',
        border: '1px dashed hsl(var(--muted))',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      };
      newElementToAdd = {
        id: baseId,
        type: 'div',
        name: 'Linha de Colunas',
        styles: {
          desktop: {
            display: 'flex',
            width: '100%',
            gap: '1rem',
            padding: '0.5rem',
            border: '1px dashed hsl(var(--border))',
            minHeight: '120px',
          }
        },
        attributes: {},
        children: [
          {
            id: crypto.randomUUID(), type: 'div', name: 'Coluna 1',
            styles: { desktop: { ...columnElementDefaultStyles } }, attributes: {}, children: [],
          },
          {
            id: crypto.randomUUID(), type: 'div', name: 'Coluna 2',
            styles: { desktop: { ...columnElementDefaultStyles } }, attributes: {}, children: [],
          },
        ],
      };
    } else {
      const itemTemplate = AVAILABLE_ELEMENTS.find(el => el.type === itemType);
      if (!itemTemplate) return;

      newElementToAdd = {
        id: baseId,
        type: itemTemplate.type as EditorElement['type'],
        name: `${itemTemplate.label} ${Math.floor(Math.random() * 1000)}`,
        content: itemTemplate.defaultContent,
        attributes: itemTemplate.defaultAttributes ? { ...itemTemplate.defaultAttributes } : {},
        styles: { 
          desktop: itemTemplate.defaultStyles ? { ...itemTemplate.defaultStyles } : {},
          tablet: {},
          mobile: {}
        },
        children: [],
      };

      if ((itemTemplate.type === 'ul' || itemTemplate.type === 'ol') && newElementToAdd.type !== 'card' && newElementToAdd.type !== 'section-columns') {
        const listItemTemplate = AVAILABLE_ELEMENTS.find(el => el.type === 'li');
        const listItem: EditorElement = {
          id: crypto.randomUUID(), type: 'li', name: 'Item da Lista',
          content: listItemTemplate?.defaultContent || 'Item da lista',
          attributes: listItemTemplate?.defaultAttributes || {},
          styles: { 
            desktop: listItemTemplate?.defaultStyles || { marginBottom: '0.25rem' },
            tablet: {},
            mobile: {}
          },
          children: [],
        };
        newElementToAdd.children.push(listItem);
      }
    }

    if (newElementToAdd) {
      if (parentId) {
        const parentElement = findElementRecursive(elements, parentId);
        const canAcceptChild = parentElement &&
                               (parentElement.type === 'div' ||
                                parentElement.type === 'ul' ||
                                parentElement.type === 'ol' ||
                                (parentElement.type === 'li' && newElementToAdd.type !== 'li'));

        if (canAcceptChild) {
           setElements(prevElements => addElementToParent(prevElements, parentId, newElementToAdd!));
        } else {
          setElements(prevElements => [...prevElements, newElementToAdd!]);
        }
      } else {
        setElements(prevElements => [...prevElements, newElementToAdd!]);
      }
      selectElement(newElementToAdd.id);
    }
  }, [elements]);

  const updateElement = useCallback((elementId: string, updates: Partial<EditorElement>) => {
    setElements(prevElements => updateElementRecursive(prevElements, elementId, updates));
    if (selectedElement?.id === elementId) {
      setSelectedElement(prevSelected => {
        if (!prevSelected) return null;
        const updatedSelected = { ...prevSelected, ...updates };
        if (updates.styles) {
          updatedSelected.styles = { ...prevSelected.styles, ...updates.styles } as ResponsiveStyles;
        }
        if (updates.attributes) {
          updatedSelected.attributes = { ...prevSelected.attributes, ...updates.attributes };
        }
        return updatedSelected;
      });
    }
  }, [selectedElement?.id]);

  const updateElementStyle = useCallback((elementId: string, newStylesForCurrentBreakpoint: CSSProperties) => {
      const elementToUpdate = findElementRecursive(elements, elementId);
      if (!elementToUpdate) return;

      const updatedStyles: ResponsiveStyles = {
        ...elementToUpdate.styles,
        [viewportMode]: {
          ...(elementToUpdate.styles[viewportMode] || {}),
          ...newStylesForCurrentBreakpoint,
        },
      };
      updateElement(elementId, { styles: updatedStyles });

  }, [viewportMode, updateElement, elements]);


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
        pageSettings,
        isCanvasFullScreen,
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
        setPageSettings: setPageSettingsState, // Expose setPageSettingsState
        setViewportMode,
        updatePageSetting,
        toggleCanvasFullScreen,
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
