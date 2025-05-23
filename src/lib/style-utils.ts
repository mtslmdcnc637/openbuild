
import type { CSSProperties } from 'react';
import type { ResponsiveStyles, ViewportMode } from '@/types/editor';

/**
 * Parses a CSS string into a React CSSProperties object.
 * Example: "color: red; font-size: 16px;"
 * Becomes: { color: "red", fontSize: "16px" }
 */
export function parseCssStringToStyleObject(cssString: string): CSSProperties {
  const style: CSSProperties = {};
  if (!cssString || typeof cssString !== 'string') {
    return style;
  }

  cssString.split(';').forEach(rule => {
    if (!rule.includes(':')) return;
    const [property, value] = rule.split(/:(.*)/s).map(s => s.trim());

    if (property && value) {
      const camelCaseProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      // @ts-ignore
      style[camelCaseProperty] = value;
    }
  });
  return style;
}

/**
 * Converts a React CSSProperties object to a CSS string.
 * Example: { color: "red", fontSize: "16px" }
 * Becomes: "color: red; font-size: 16px;"
 */
export function styleObjectToCssString(styles: CSSProperties): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      if (value === undefined || value === null) return '';
      const cssProperty = key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
      return `${cssProperty}: ${value};`;
    })
    .join(' ');
}

/**
 * Converts a React CSSProperties object to an inline style string for HTML elements.
 */
export function convertToInlineStyle(styles: CSSProperties | undefined): string {
  if (!styles) return "";
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const propertyName = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
      return `${propertyName}:${value}`;
    })
    .join(";");
}

/**
 * Computes the final CSSProperties for an element based on the current viewport mode,
 * applying overrides from tablet and mobile breakpoints over desktop styles.
 */
export function getComputedStyles(
  responsiveStyles: ResponsiveStyles,
  viewportMode: ViewportMode
): CSSProperties {
  let computed: CSSProperties = { ...responsiveStyles.desktop };

  if (viewportMode === 'tablet' || viewportMode === 'mobile') {
    if (responsiveStyles.tablet) {
      computed = { ...computed, ...responsiveStyles.tablet };
    }
  }
  if (viewportMode === 'mobile') {
    if (responsiveStyles.mobile) {
      computed = { ...computed, ...responsiveStyles.mobile };
    }
  }
  return computed;
}
