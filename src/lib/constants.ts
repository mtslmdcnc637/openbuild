
import type { DraggableItem } from '@/types/editor';

export const AVAILABLE_ELEMENTS: DraggableItem[] = [
  {
    type: 'h1',
    label: 'Heading 1',
    defaultContent: 'Main Heading',
    defaultStyles: { fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0' },
  },
  {
    type: 'h2',
    label: 'Heading 2',
    defaultContent: 'Subheading',
    defaultStyles: { fontSize: '2rem', fontWeight: 'bold', margin: '0.8rem 0' },
  },
  {
    type: 'p',
    label: 'Paragraph',
    defaultContent: 'This is a paragraph. You can edit this text.',
    defaultStyles: { fontSize: '1rem', margin: '0.5rem 0', lineHeight: '1.6' },
  },
  {
    type: 'button',
    label: 'Button',
    defaultContent: 'Click Me',
    defaultStyles: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      border: 'none',
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
    },
  },
  {
    type: 'div',
    label: 'Container (Div)',
    defaultStyles: {
      padding: '1rem',
      minHeight: '100px',
      border: '1px dashed hsl(var(--border))',
      width: '100%',
    },
  },
  {
    type: 'img',
    label: 'Image',
    defaultAttributes: {
      src: 'https://placehold.co/200x150.png',
      alt: 'Placeholder image',
    },
    defaultStyles: {
      width: '200px',
      height: '150px',
      objectFit: 'cover',
    },
  },
  {
    type: 'icon',
    label: 'Icon',
    defaultAttributes: {
      iconName: 'Smile', // Default icon from lucide-react
      size: '24',       // Default size as string for input consistency
      strokeWidth: '2', // Default strokeWidth as string
    },
    defaultStyles: {
      color: 'currentColor', // Inherits color from parent by default
      display: 'inline-block', // Ensures proper layout
    },
  },
  {
    type: 'span',
    label: 'Text Span',
    defaultContent: 'Inline text',
    defaultStyles: { fontSize: '1rem' },
  },
  {
    type: 'ul',
    label: 'Unordered List',
    defaultStyles: { margin: '0.5rem 0', paddingLeft: '40px' },
    // Children (li) will be added by EditorContext
  },
  {
    type: 'ol',
    label: 'Ordered List',
    defaultStyles: { margin: '0.5rem 0', paddingLeft: '40px' },
    // Children (li) will be added by EditorContext
  },
  // 'li' is not directly draggable but created by 'ul'/'ol' or 'Add List Item' button
  {
    type: 'a',
    label: 'Link',
    defaultContent: 'Link Text',
    defaultAttributes: { href: '#' },
    defaultStyles: { color: 'hsl(var(--primary))', textDecoration: 'underline', cursor: 'pointer' },
  },
  {
    type: 'hr',
    label: 'Divider (HR)',
    defaultStyles: { borderTop: '1px solid hsl(var(--border))', margin: '1rem 0', height: 'auto', width: '100%' },
  },
  {
    type: 'input',
    label: 'Text Input',
    // No defaultContent for input, value is an attribute
    defaultAttributes: { type: 'text', placeholder: 'Enter text...' },
    defaultStyles: {
      padding: '0.5rem',
      border: '1px solid hsl(var(--input))',
      borderRadius: 'var(--radius)',
      width: '100%',
      boxSizing: 'border-box', // Ensure padding and border are inside width
    },
  },
  {
    type: 'textarea',
    label: 'Textarea',
    defaultContent: '', // Content will be the value
    defaultAttributes: { placeholder: 'Enter more text...' },
    defaultStyles: {
      padding: '0.5rem',
      border: '1px solid hsl(var(--input))',
      borderRadius: 'var(--radius)',
      minHeight: '80px',
      width: '100%',
      boxSizing: 'border-box',
    },
  },
  {
    type: 'label',
    label: 'Label',
    defaultContent: 'Label Text',
    defaultAttributes: { htmlFor: '' },
    defaultStyles: { display: 'block', marginBottom: '0.25rem', fontWeight: 'medium' },
  },
  {
    type: 'card', // This is a meta-type for the panel, it will create a div with children
    label: 'Card',
    // defaultStyles, defaultContent, defaultAttributes are handled by EditorContext for 'card'
  },
];
