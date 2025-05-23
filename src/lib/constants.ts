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
    type: 'span',
    label: 'Text Span',
    defaultContent: 'Inline text',
    defaultStyles: { fontSize: '1rem' },
  },
];
