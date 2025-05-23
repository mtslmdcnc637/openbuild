
import type { EditorElement } from '@/types/editor';
import { convertToInlineStyle, getComputedStyles } from './style-utils'; // Import getComputedStyles

function generateElementHtml(element: EditorElement): string {
  const Tag = element.type;
  // For HTML export, we'll use desktop styles as the primary source for simplicity.
  // A more advanced version could generate media queries.
  const styleString = convertToInlineStyle(element.styles.desktop);
  
  let attributesString = '';
  if (element.attributes) {
    attributesString = Object.entries(element.attributes)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }

  const childrenHtml = element.children.map(generateElementHtml).join('');
  
  let content = element.content || '';
  if (Tag === 'img') {
    return `<${Tag} style="${styleString}" ${attributesString} />`;
  }

  // For input elements, the value attribute should be used.
  if (Tag === 'input' && element.attributes?.value) {
    content = ''; // Content is handled by the value attribute
  }
  // For textarea, content is its children in React, but innerHTML in raw HTML.
  if (Tag === 'textarea') {
     return `<${Tag} style="${styleString}" ${attributesString}>${element.content || ''}</${Tag}>`;
  }


  return `<${Tag} style="${styleString}" ${attributesString}>${content}${childrenHtml}</${Tag}>`;
}

// This function might be less relevant if we're heavily relying on inline styles
// or would need significant rework for media queries.
function generatePageStyles(elements: EditorElement[], classPrefix = 'el-'): string {
  let styles = `body { margin: 0; font-family: var(--font-geist-sans, sans-serif); background-color: hsl(var(--background)); color: hsl(var(--foreground)); }\n`;
  
  function collectStylesRecursive(els: EditorElement[], currentStyles: string[]): void {
    els.forEach(el => {
      // If we were to generate classes:
      // const className = `${classPrefix}${el.id.substring(0, 8)}`;
      // const desktopCss = styleObjectToCssString(el.styles.desktop);
      // styles += `.${className} { ${desktopCss} }\n`;
      // // Add media queries for tablet and mobile if they exist
      if (el.children.length > 0) {
        collectStylesRecursive(el.children, currentStyles);
      }
    });
  }
  
  const elementSpecificStyles: string[] = [];
  collectStylesRecursive(elements, elementSpecificStyles);
  styles += elementSpecificStyles.join('\n');
  
  return styles;
}


export function generateHtmlDocument(elements: EditorElement[], pageTitle: string = "Code Canvas Export"): string {
  const bodyContent = elements.map(generateElementHtml).join('\n    ');
  // const pageStyles = generatePageStyles(elements); // Placeholder if we move away from all inline

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <style>
      body { 
        margin: 0; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        --background: 220 13% 95%; /* Light Gray #F0F2F5 from globals.css */
        --foreground: 215 25% 27%; /* Dark Slate Gray #3A4F62 from globals.css */
        background-color: hsl(var(--background)); 
        color: hsl(var(--foreground)); 
      }
      /* For a full solution with media queries, pageStyles would be generated and inserted here. */
      /* For now, relying on inline styles from generateElementHtml (desktop styles). */
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>`;
}

export function downloadHtmlFile(htmlContent: string, filename: string = "code-canvas-page.html"): void {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
