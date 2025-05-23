
import type { CSSProperties } from 'react';

export type EditorElementType =
  | 'div'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'button'
  | 'img'
  | 'span'
  | 'ul'  // Unordered List
  | 'ol'  // Ordered List
  | 'li'  // List Item
  | 'a'   // Link
  | 'hr'  // Horizontal Rule
  | 'input' // Form input
  | 'textarea' // Form textarea
  | 'label' // Form label
  | 'icon'; // Icon element

export interface ResponsiveStyles {
  desktop: CSSProperties;
  tablet?: CSSProperties;
  mobile?: CSSProperties;
}

export interface EditorElement {
  id: string;
  type: EditorElementType;
  name: string;
  content?: string;
  attributes?: {
    src?: string;
    alt?: string;
    href?: string;
    htmlFor?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    iconName?: string;
    size?: string | number;
    strokeWidth?: string | number;
    [key: string]: string | number | boolean | undefined;
  };
  styles: ResponsiveStyles;
  children: EditorElement[];
}

export type DraggableItemType = EditorElementType | 'card' | 'section-columns';

export interface DraggableItem {
  type: DraggableItemType;
  label: string;
  defaultStyles?: CSSProperties;
  defaultContent?: string;
  defaultAttributes?: EditorElement['attributes'];
}

export interface Point {
  x: number;
  y: number;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface PageSettings {
  pageTitle: string;
  bodyBackgroundColor: string;
  bodyBackgroundImageUrl: string;
  facebookPixelId: string;
  tiktokPixelId: string;
  googleTagManagerId: string;
}

export interface EditorContextType {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  viewportMode: ViewportMode;
  pageSettings: PageSettings;
  isCanvasFullScreen: boolean;
  addElement: (itemType: DraggableItemType, parentId?: string) => void;
  updateElement: (elementId: string, updates: Partial<EditorElement>) => void;
  updateElementStyle: (elementId: string, newStylesForCurrentBreakpoint: CSSProperties) => void;
  updateElementContent: (elementId: string, content: string) => void;
  updateElementAttribute: (elementId: string, attributeName: string, value: string) => void;
  updateElementName: (elementId: string, name: string) => void;
  selectElement: (elementId: string | null) => void;
  deleteElement: (elementId: string) => void;
  moveElement: (draggedId: string, targetId: string | null, position?: 'before' | 'after' | 'inside') => void;
  setElements: React.Dispatch<React.SetStateAction<EditorElement[]>>;
  setViewportMode: (mode: ViewportMode) => void;
  updatePageSetting: <K extends keyof PageSettings>(settingName: K, value: PageSettings[K]) => void;
  toggleCanvasFullScreen: () => void;
}
