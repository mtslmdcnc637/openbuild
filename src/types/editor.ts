import type { CSSProperties } from 'react';

export type EditorElementType = 
  | 'div' 
  | 'p' 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'button' 
  | 'img' 
  | 'span';

export interface EditorElement {
  id: string;
  type: EditorElementType;
  name: string; // User-friendly name, e.g., "Main Container", "Submit Button"
  content?: string; // Text for p, h1, button, span
  attributes?: {
    src?: string;
    alt?: string;
    href?: string;
    [key: string]: string | undefined; // Allow other HTML attributes
  };
  styles: CSSProperties;
  children: EditorElement[]; // For nesting
}

export interface DraggableItem {
  type: EditorElementType;
  label: string;
  defaultStyles?: CSSProperties;
  defaultContent?: string;
  defaultAttributes?: EditorElement['attributes'];
}

export interface Point {
  x: number;
  y: number;
}
