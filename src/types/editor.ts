
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
  styles: ResponsiveStyles; // Alterado para suportar estilos responsivos
  children: EditorElement[];
}

export type DraggableItemType = EditorElementType | 'card' | 'section-columns';

export interface DraggableItem {
  type: DraggableItemType;
  label: string;
  defaultStyles?: CSSProperties; // Estilos padrão serão aplicados ao breakpoint 'desktop'
  defaultContent?: string;
  defaultAttributes?: EditorElement['attributes'];
}

export interface Point {
  x: number;
  y: number;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

