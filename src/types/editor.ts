
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
  | 'label'; // Form label

export interface EditorElement {
  id: string;
  type: EditorElementType;
  name: string; // User-friendly name, e.g., "Main Container", "Submit Button"
  content?: string; // Text for p, h1, button, span, li, a, label, textarea value
  attributes?: {
    src?: string;
    alt?: string;
    href?: string;
    htmlFor?: string; // For label
    type?: string; // For input
    placeholder?: string; // For input, textarea
    value?: string; // For input (prefer over content for input type text)
    [key: string]: string | number | boolean | undefined; // Allow other HTML attributes
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
