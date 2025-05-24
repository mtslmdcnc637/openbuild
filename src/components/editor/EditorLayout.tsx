
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DraggableElementsPanel } from './DraggableElementsPanel';
import { CanvasArea } from './CanvasArea';
import { StyleConfigurationPanel } from './StyleConfigurationPanel';
import { CodeCanvasLogo } from '@/components/icons/CodeCanvasLogo';
import { Button } from '@/components/ui/button';
import { useEditor } from '@/contexts/EditorContext';
import { generateHtmlDocument } from '@/lib/html-generator';
import { downloadJsonFile, downloadHtmlFile } from '@/lib/download-utils';
import { Download, Monitor, Tablet, Smartphone, Eye, Maximize, Minimize, Expand, Shrink, Save, Upload, Info } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import type { ViewportMode, ProjectData, EditorElement, PageSettings } from '@/types/editor';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SaveWarningDialog } from './SaveWarningDialog';


export function EditorLayout() {
  const { 
    elements, 
    viewportMode, 
    setViewportMode, 
    pageSettings, 
    isCanvasFullScreen, 
    toggleCanvasFullScreen,
    setElements,
    setPageSettings,
    selectElement
  } = useEditor();
  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showSaveWarning, setShowSaveWarning] = useState(false);

  useEffect(() => {
    const warningDismissed = localStorage.getItem('openBuildSaveWarningDismissed');
    if (!warningDismissed) {
      setShowSaveWarning(true);
    }
  }, []);

  const handleDismissSaveWarning = () => {
    localStorage.setItem('openBuildSaveWarningDismissed', 'true');
    setShowSaveWarning(false);
  };


  const handleExportHtml = () => {
    const htmlContent = generateHtmlDocument(elements, pageSettings);
    const safePageTitle = pageSettings.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'pagina_openbuild';
    downloadHtmlFile(htmlContent, `${safePageTitle}.html`);
     toast({
      title: "HTML Exportado",
      description: `Seu arquivo ${safePageTitle}.html foi baixado.`,
    });
  };

  const handlePreview = () => {
    const htmlContent = generateHtmlDocument(elements, pageSettings);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // URL.revokeObjectURL(url); // Revoke might be too soon if the new tab hasn't loaded. Browsers handle this.
  };

  const handleDownloadProject = () => {
    const projectData: ProjectData = {
      openBuildVersion: "1.0.0", // Versioning for future compatibility
      pageSettings,
      elements,
    };
    const safePageTitle = pageSettings.pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'projeto_openbuild';
    downloadJsonFile(projectData, `${safePageTitle}.openbuild`);
    toast({
      title: "Projeto Baixado",
      description: `Seu projeto foi baixado como ${safePageTitle}.openbuild. Lembre-se que ele é salvo localmente.`,
    });
  };

  const handleLoadProjectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({ title: "Nenhum arquivo selecionado", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const projectData = JSON.parse(text) as ProjectData;

        // Basic validation
        if (!projectData || typeof projectData.openBuildVersion !== 'string' || !projectData.pageSettings || !Array.isArray(projectData.elements)) {
          throw new Error("Formato de arquivo inválido.");
        }
        
        // Add more robust validation/migration based on openBuildVersion in the future if needed

        setElements(projectData.elements as EditorElement[]); // Type assertion if needed
        setPageSettings(projectData.pageSettings as PageSettings);
        selectElement(null); // Clear current selection

        toast({
          title: "Projeto Carregado",
          description: `O projeto "${file.name}" foi carregado com sucesso.`,
        });

      } catch (error) {
        console.error("Erro ao carregar projeto:", error);
        toast({
          title: "Erro ao Carregar Projeto",
          description: error instanceof Error ? error.message : "O arquivo selecionado não é um projeto OpenBuild válido.",
          variant: "destructive",
        });
      } finally {
        // Reset file input to allow loading the same file again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
       toast({
          title: "Erro de Leitura do Arquivo",
          description: "Não foi possível ler o arquivo selecionado.",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    }
    reader.readAsText(file);
  };


  const viewportButtons: { mode: ViewportMode; icon: React.ElementType; label: string }[] = [
    { mode: 'desktop', icon: Monitor, label: 'Desktop' },
    { mode: 'tablet', icon: Tablet, label: 'Tablet' },
    { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
  ];

  const handleToggleBrowserFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao tentar entrar em tela cheia: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsBrowserFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);


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
           <Button
              variant={isCanvasFullScreen ? 'default' : 'outline'}
              size="icon"
              onClick={toggleCanvasFullScreen}
              aria-label={isCanvasFullScreen ? "Sair da Tela Cheia do Canvas" : "Tela Cheia do Canvas"}
              title={isCanvasFullScreen ? "Sair da Tela Cheia do Canvas" : "Tela Cheia do Canvas"}
              className={cn(
                "h-8 w-8",
                isCanvasFullScreen ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isCanvasFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button
              variant={isBrowserFullScreen ? 'default' : 'outline'}
              size="icon"
              onClick={handleToggleBrowserFullScreen}
              aria-label={isBrowserFullScreen ? "Sair da Tela Cheia" : "Entrar em Tela Cheia"}
              title={isBrowserFullScreen ? "Sair da Tela Cheia" : "Entrar em Tela Cheia"}
              className={cn(
                "h-8 w-8",
                isBrowserFullScreen ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isBrowserFullScreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
        </div>

        <div className="flex items-center gap-2">
           <Button onClick={handleDownloadProject} variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Baixar Projeto
          </Button>
          <Button onClick={handleLoadProjectClick} variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Carregar Projeto
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".openbuild,.json"
            className="hidden"
          />
          <Button onClick={handlePreview} variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
          <Button onClick={handleExportHtml} variant="default" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar HTML
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSaveWarning(true)}
            aria-label="Informações sobre salvamento"
            title="Informações sobre salvamento"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {!isCanvasFullScreen && (
          <aside className="w-64 flex-shrink-0 overflow-y-auto">
            <DraggableElementsPanel />
          </aside>
        )}
        <main className={cn(
          "flex-1 overflow-y-auto bg-muted/40",
          isCanvasFullScreen && "w-full" 
        )}>
          <CanvasArea />
        </main>
        {!isCanvasFullScreen && (
          <aside className="w-80 flex-shrink-0 overflow-y-auto">
            <StyleConfigurationPanel />
          </aside>
        )}
      </div>
      <Toaster />
      <SaveWarningDialog isOpen={showSaveWarning} onDismiss={handleDismissSaveWarning} />
    </div>
  );
}

    