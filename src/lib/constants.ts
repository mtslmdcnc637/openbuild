
import type { DraggableItem } from '@/types/editor';

export const AVAILABLE_ELEMENTS: DraggableItem[] = [
  {
    type: 'h1',
    label: 'Título Principal (H1)',
    defaultContent: 'Título Principal',
    defaultStyles: { fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0' },
  },
  {
    type: 'h2',
    label: 'Subtítulo (H2)',
    defaultContent: 'Subtítulo',
    defaultStyles: { fontSize: '2rem', fontWeight: 'bold', margin: '0.8rem 0' },
  },
  {
    type: 'h3',
    label: 'Título de Seção (H3)',
    defaultContent: 'Título da Seção',
    defaultStyles: { fontSize: '1.75rem', fontWeight: 'bold', margin: '0.7rem 0' },
  },
  {
    type: 'p',
    label: 'Parágrafo',
    defaultContent: 'Este é um parágrafo. Você pode editar este texto.',
    defaultStyles: { fontSize: '1rem', margin: '0.5rem 0', lineHeight: '1.6' },
  },
  {
    type: 'button',
    label: 'Botão',
    defaultContent: 'Clique Aqui',
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
    label: 'Contêiner (Div)',
    defaultStyles: {
      padding: '1rem',
      minHeight: '100px',
      border: '1px dashed hsl(var(--border))',
      width: '100%',
    },
  },
  {
    type: 'img',
    label: 'Imagem',
    defaultAttributes: {
      src: 'https://placehold.co/200x150.png',
      alt: 'Imagem de exemplo',
    },
    defaultStyles: {
      width: '200px',
      height: '150px',
      objectFit: 'cover',
    },
  },
  {
    type: 'icon',
    label: 'Ícone',
    defaultAttributes: {
      iconName: 'Smile', // Nome do ícone Lucide
      size: '24',
      strokeWidth: '2',
    },
    defaultStyles: {
      color: 'currentColor',
      display: 'inline-block',
    },
  },
  {
    type: 'span',
    label: 'Texto (Span)',
    defaultContent: 'Texto em linha',
    defaultStyles: { fontSize: '1rem' },
  },
  {
    type: 'ul',
    label: 'Lista (Não Ordenada)',
    defaultStyles: { margin: '0.5rem 0', paddingLeft: '40px' },
  },
  {
    type: 'ol',
    label: 'Lista (Ordenada)',
    defaultStyles: { margin: '0.5rem 0', paddingLeft: '40px' },
  },
  {
    type: 'a',
    label: 'Link',
    defaultContent: 'Texto do Link',
    defaultAttributes: { href: '#' },
    defaultStyles: { color: 'hsl(var(--primary))', textDecoration: 'underline', cursor: 'pointer' },
  },
  {
    type: 'hr',
    label: 'Divisor (Linha)',
    defaultStyles: { borderTop: '1px solid hsl(var(--border))', margin: '1rem 0', height: 'auto', width: '100%' },
  },
  {
    type: 'input',
    label: 'Campo de Texto',
    defaultAttributes: { type: 'text', placeholder: 'Digite o texto...' },
    defaultStyles: {
      padding: '0.5rem',
      border: '1px solid hsl(var(--input))',
      borderRadius: 'var(--radius)',
      width: '100%',
      boxSizing: 'border-box',
    },
  },
  {
    type: 'textarea',
    label: 'Área de Texto',
    defaultContent: '',
    defaultAttributes: { placeholder: 'Digite mais texto...' },
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
    label: 'Rótulo (Label)',
    defaultContent: 'Texto do Rótulo',
    defaultAttributes: { htmlFor: '' },
    defaultStyles: { display: 'block', marginBottom: '0.25rem', fontWeight: '500' }, // fontWeight changed to medium
  },
  {
    type: 'card',
    label: 'Cartão (Card)',
  },
];
