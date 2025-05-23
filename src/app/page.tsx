"use client"; // page.tsx needs to be a client component to use context provider

import { EditorProvider } from '@/contexts/EditorContext';
import { EditorLayout } from '@/components/editor/EditorLayout';

export default function CodeCanvasPage() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}
