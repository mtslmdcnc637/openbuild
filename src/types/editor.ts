
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
  // 'card' is not a direct HTML element type, but a DraggableItem type that creates a structure.

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
    iconName?: string; // For icon
    size?: string | number; // For icon
    strokeWidth?: string | number; // For icon
    [key: string]: string | number | boolean | undefined; // Allow other HTML attributes
  };
  styles: CSSProperties; // TODO: Refactor to support responsive styles per breakpoint
  children: EditorElement[]; // For nesting
}

export type DraggableItemType = EditorElementType | 'card'; // 'card' is a special draggable type

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
