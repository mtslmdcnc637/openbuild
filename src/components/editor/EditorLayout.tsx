
"use client";

import React from 'react';
import { DraggableElementsPanel } from './DraggableElementsPanel';
import { CanvasArea } from './CanvasArea';
import { StyleConfigurationPanel } from './StyleConfigurationPanel';
import { CodeCanvasLogo } from '@/components/icons/CodeCanvasLogo';
import { Button } from '@/components/ui/button';
import { useEditor } from '@/contexts/EditorContext';
import { generateHtmlDocument, downloadHtmlFile } from '@/lib/html-generator';
import { Download, Monitor, Tablet, Smartphone } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import type { ViewportMode } from '@/types/editor';
import { cn } from '@/lib/utils';

export function EditorLayout() {
  const { elements, viewportMode, setViewportMode, pageSettings } = useEditor();

  const handleExportHtml = () => {
    // Pass current elements and pageSettings to the generator
    const htmlContent = generateHtmlDocument(elements, pageSettings);
    downloadHtmlFile(htmlContent, `${pageSettings.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'pagina'}.html`);
  };

  const viewportButtons: { mode: ViewportMode; icon: React.ElementType; label: string }[] = [
    { mode: 'desktop', icon: Monitor, label: 'Desktop' },
    { mode: 'tablet', icon: Tablet, label: 'Tablet' },
    { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="flex items-center justify-between p-3 border-b shadow-sm sticky top-0 bg-card z-10">
        <CodeCanvasLogo />
        <div className="flex items-center gap-2">
          {viewportButtons.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewportMode === mode ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewportMode(mode)}
              aria-label={`Visualizar em ${label}`}
              title={`Visualizar em ${label}`}
              className={cn(
                "h-8 w-8",
                viewportMode === mode ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
        <Button onClick={handleExportHtml} variant="default" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar HTML
        </Button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 overflow-y-auto">
          <DraggableElementsPanel />
        </aside>
        <main className="flex-1 overflow-y-auto bg-muted/40">
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
