
"use client";

import React from 'react';
import { DraggableElementsPanel } from './DraggableElementsPanel';
import { CanvasArea } from './CanvasArea';
import { StyleConfigurationPanel } from './StyleConfigurationPanel';
import { CodeCanvasLogo } from '@/components/icons/CodeCanvasLogo';
import { Button } from '@/components/ui/button';
import { useEditor } from '@/contexts/EditorContext';
import { generateHtmlDocument, downloadHtmlFile } from '@/lib/html-generator';
import { Download } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export function EditorLayout() {
  const { elements } = useEditor();

  const handleExportHtml = () => {
    const htmlContent = generateHtmlDocument(elements, "Minha Página Incrível");
    downloadHtmlFile(htmlContent);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="flex items-center justify-between p-3 border-b shadow-sm sticky top-0 bg-card z-10">
        <CodeCanvasLogo />
        <Button onClick={handleExportHtml} variant="default" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar HTML
        </Button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 overflow-y-auto">
          <DraggableElementsPanel />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <CanvasArea />
        </main>
        <aside className="w-80 flex-shrink-0 overflow-y-auto">
          <StyleConfigurationPanel />
        </aside>
      </div>
      <Toaster />
    </div>
  );
}
