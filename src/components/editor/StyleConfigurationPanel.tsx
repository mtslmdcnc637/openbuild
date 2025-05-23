
"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StylePropertyInput } from './StylePropertyInput';
import type { CSSProperties } from 'react';
import { suggestElementStyle, type SuggestElementStyleInput } from '@/ai/flows/suggest-element-style';
import { parseCssStringToStyleObject } from '@/lib/style-utils';
import { toast } from '@/hooks/use-toast';
import { Trash2, Wand2, PlusCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const commonFontFamilies = [
  { label: "Padrão do Sistema", value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Times New Roman", value: "Times, 'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "Courier, 'Courier New', monospace" },
  { label: "Geist Sans", value: "var(--font-geist-sans)"},
  { label: "Geist Mono", value: "var(--font-geist-mono)"}
];

const textAlignOptions = [
  { label: 'Esquerda', value: 'left' },
  { label: 'Centro', value: 'center' },
  { label: 'Direita', value: 'right' },
  { label: 'Justificado', value: 'justify' },
];

const fontWeightOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Negrito', value: 'bold' },
  { label: '100', value: '100' },
  { label: '200', value: '200' },
  { label: '300', value: '300' },
  { label: '400', value: '400' },
  { label: '500', value: '500' },
  { label: '600', value: '600' },
  { label: '700', value: '700' },
  { label: '800', value: '800' },
  { label: '900', value: '900' },
];

const displayOptions = [
  { label: 'Bloco (block)', value: 'block' },
  { label: 'Em Linha (inline)', value: 'inline' },
  { label: 'Bloco em Linha (inline-block)', value: 'inline-block' },
  { label: 'Flexível (flex)', value: 'flex' },
  { label: 'Flexível em Linha (inline-flex)', value: 'inline-flex' },
  { label: 'Grade (grid)', value: 'grid' },
  { label: 'Grade em Linha (inline-grid)', value: 'inline-grid' },
  { label: 'Nenhum (none)', value: 'none' },
];

const alignItemsOptions = [
  { label: 'Início (flex-start)', value: 'flex-start' },
  { label: 'Fim (flex-end)', value: 'flex-end' },
  { label: 'Centro (center)', value: 'center' },
  { label: 'Linha de Base (baseline)', value: 'baseline' },
  { label: 'Esticar (stretch)', value: 'stretch' },
];

const justifyContentOptions = [
  { label: 'Início (flex-start)', value: 'flex-start' },
  { label: 'Fim (flex-end)', value: 'flex-end' },
  { label: 'Centro (center)', value: 'center' },
  { label: 'Espaço Entre (space-between)', value: 'space-between' },
  { label: 'Espaço ao Redor (space-around)', value: 'space-around' },
  { label: 'Espaço Uniforme (space-evenly)', value: 'space-evenly' },
];

const objectFitOptions = [
    { label: 'Preencher (fill)', value: 'fill' },
    { label: 'Conter (contain)', value: 'contain' },
    { label: 'Cobrir (cover)', value: 'cover' },
    { label: 'Nenhum (none)', value: 'none' },
    { label: 'Reduzir Escala (scale-down)', value: 'scale-down' },
];

export function StyleConfigurationPanel() {
  const { selectedElement, updateElementStyle, updateElementContent, updateElementAttribute, updateElementName, deleteElement, addElement } = useEditor();
  const [localStyles, setLocalStyles] = useState<CSSProperties>({});
  const [content, setContent] = useState<string>('');
  const [elementName, setElementName] = useState<string>('');
  const [attributes, setAttributes] = useState<Record<string, string | number | boolean | undefined>>({});
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestedCss, setAiSuggestedCss] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      setLocalStyles(selectedElement.styles || {});
      if (selectedElement.type === 'input') {
        setContent(String(selectedElement.attributes?.value || ''));
      } else {
        setContent(selectedElement.content || '');
      }
      setElementName(selectedElement.name || `Elemento ${selectedElement.id.substring(0,4)}`);
      setAttributes(selectedElement.attributes || {});
    } else {
      setLocalStyles({});
      setContent('');
      setElementName('');
      setAttributes({});
    }
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <div className="p-4 border-l h-full bg-card text-muted-foreground flex items-center justify-center">
        <p className="text-sm">Selecione um elemento para configurar.</p>
      </div>
    );
  }

  const handleStyleChange = (property: keyof CSSProperties, value: string) => {
    const newStyles = { ...localStyles, [property]: value };
    setLocalStyles(newStyles);
    updateElementStyle(selectedElement.id, newStyles);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateElementContent(selectedElement.id, newContent);
  };
  
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setElementName(e.target.value);
    updateElementName(selectedElement.id, e.target.value);
  };
  
  const handleAttributeChangeLocal = (attrName: string, value: string | number) => {
    const newAttributes = { ...attributes, [attrName]: String(value) };
    setAttributes(newAttributes);
    updateElementAttribute(selectedElement.id, attrName, String(value));
  };

  const handleAiStyleSuggest = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "Prompt da IA Vazio", description: "Por favor, descreva o estilo que você deseja.", variant: "destructive" });
      return;
    }
    setIsAiLoading(true);
    setAiSuggestedCss('');
    try {
      const input: SuggestElementStyleInput = { elementDescription: aiPrompt };
      const result = await suggestElementStyle(input);
      if (result.cssRules) {
        setAiSuggestedCss(result.cssRules);
        toast({ title: "Sugestão da IA Recebida", description: "Revise o CSS sugerido abaixo." });
      } else {
        toast({ title: "Falha na Sugestão da IA", description: "A IA não conseguiu gerar estilos para este prompt.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro na sugestão de estilo da IA:", error);
      toast({ title: "Erro na IA", description: "Ocorreu um erro ao buscar sugestões da IA.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestedStyle = () => {
    if (!aiSuggestedCss) return;
    const suggestedStylesObject = parseCssStringToStyleObject(aiSuggestedCss);
    const newStyles = { ...localStyles, ...suggestedStylesObject };
    setLocalStyles(newStyles);
    updateElementStyle(selectedElement.id, newStyles);
    toast({ title: "Estilos da IA Aplicados", description: "Os estilos sugeridos foram aplicados ao elemento." });
  };
  
  const handleAddListItem = () => {
    if (selectedElement && (selectedElement.type === 'ul' || selectedElement.type === 'ol' || selectedElement.type === 'li')) {
      const parentListId = selectedElement.type === 'li' ? findParentListId(selectedElement.id) : selectedElement.id;
      if (parentListId) {
        addElement('li', parentListId);
      }
    }
  };

  const findParentListId = (childId: string): string | undefined => {
    // Placeholder - needs robust implementation
    return selectedElement?.id; 
  };


  const renderContentInput = () => {
    if (['p', 'h1', 'h2', 'h3', 'button', 'span', 'li', 'a', 'label', 'textarea'].includes(selectedElement.type)) {
      const isTextarea = selectedElement.type === 'textarea';
      return (
        <div className="space-y-1">
          <Label htmlFor="elementContent" className="text-xs">{isTextarea ? 'Valor' : 'Conteúdo do Texto'}</Label>
          <Textarea
            id="elementContent"
            value={content}
            onChange={handleContentChange}
            placeholder={isTextarea ? "Digite o texto para a área de texto..." : "Digite o conteúdo do texto..."}
            className="text-xs"
            rows={isTextarea ? 4 : 2}
          />
        </div>
      );
    }
    if (selectedElement.type === 'input') {
         return (
            <div className="space-y-1">
                <Label htmlFor="inputValue" className="text-xs">Valor</Label>
                <Input
                    id="inputValue"
                    type="text"
                    value={String(attributes.value || '')}
                    onChange={(e) => handleAttributeChangeLocal('value', e.target.value)}
                    placeholder="Digite o valor do campo"
                    className="h-8 text-xs"
                />
            </div>
         );
    }
    return null;
  };
  
  const renderAttributeInputs = () => {
    const commonInputs: JSX.Element[] = [];

    if (selectedElement.type === 'img') {
      commonInputs.push(
        <React.Fragment key="img-attrs">
          <div className="space-y-1">
            <Label htmlFor="imgSrc" className="text-xs">URL da Imagem</Label>
            <Input
              id="imgSrc"
              type="url"
              value={attributes.src as string || ''}
              onChange={(e) => handleAttributeChangeLocal('src', e.target.value)}
              placeholder="https://exemplo.com/imagem.png"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="imgAlt" className="text-xs">Texto Alternativo (Alt)</Label>
            <Input
              id="imgAlt"
              type="text"
              value={attributes.alt as string || ''}
              onChange={(e) => handleAttributeChangeLocal('alt', e.target.value)}
              placeholder="Descrição da imagem"
              className="h-8 text-xs"
            />
          </div>
        </React.Fragment>
      );
    } else if (selectedElement.type === 'icon') {
      commonInputs.push(
        <React.Fragment key="icon-attrs">
          <div className="space-y-1">
            <Label htmlFor="iconName" className="text-xs">Nome do Ícone (Lucide)</Label>
            <Input
              id="iconName"
              type="text"
              value={attributes.iconName as string || 'Smile'}
              onChange={(e) => handleAttributeChangeLocal('iconName', e.target.value)}
              placeholder="Ex: Smile, Home, Settings"
              className="h-8 text-xs"
            />
            <p className="text-xs text-muted-foreground">Encontre nomes em lucide.dev</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="iconSize" className="text-xs">Tamanho (px)</Label>
            <Input
              id="iconSize"
              type="number"
              value={attributes.size as string || '24'}
              onChange={(e) => handleAttributeChangeLocal('size', e.target.value)}
              placeholder="24"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="iconStrokeWidth" className="text-xs">Largura do Traço</Label>
            <Input
              id="iconStrokeWidth"
              type="number"
              step="0.1"
              value={attributes.strokeWidth as string || '2'}
              onChange={(e) => handleAttributeChangeLocal('strokeWidth', e.target.value)}
              placeholder="2"
              className="h-8 text-xs"
            />
          </div>
        </React.Fragment>
      );
    } else if (selectedElement.type === 'a') {
      commonInputs.push(
        <div className="space-y-1" key="a-href">
          <Label htmlFor="linkHref" className="text-xs">URL do Link (href)</Label>
          <Input
            id="linkHref"
            type="url"
            value={attributes.href as string || ''}
            onChange={(e) => handleAttributeChangeLocal('href', e.target.value)}
            placeholder="https://exemplo.com"
            className="h-8 text-xs"
          />
        </div>
      );
    } else if (selectedElement.type === 'input' || selectedElement.type === 'textarea') {
        commonInputs.push(
            <div className="space-y-1" key={`${selectedElement.type}-placeholder`}>
                <Label htmlFor={`${selectedElement.type}Placeholder`} className="text-xs">Texto de Exemplo (Placeholder)</Label>
                <Input
                    id={`${selectedElement.type}Placeholder`}
                    type="text"
                    value={attributes.placeholder as string || ''}
                    onChange={(e) => handleAttributeChangeLocal('placeholder', e.target.value)}
                    placeholder="Digite o texto de exemplo"
                    className="h-8 text-xs"
                />
            </div>
        );
    }
    if (selectedElement.type === 'input') {
        // Poderia adicionar editor do atributo 'type' aqui
    } else if (selectedElement.type === 'label') {
        commonInputs.push(
            <div className="space-y-1" key="label-for">
                <Label htmlFor="labelFor" className="text-xs">Associar a (ID do Input)</Label>
                <Input
                    id="labelFor"
                    type="text"
                    value={attributes.htmlFor as string || ''}
                    onChange={(e) => handleAttributeChangeLocal('htmlFor', e.target.value)}
                    placeholder="ID do campo de input"
                    className="h-8 text-xs"
                />
            </div>
        );
    }

    return commonInputs.length > 0 ? <>{commonInputs}</> : null;
  };

  const isFlexOrGrid = ['flex', 'inline-flex', 'grid', 'inline-grid'].includes(localStyles.display || '');
  const canHaveChildren = ['div', 'ul', 'ol', 'li'].includes(selectedElement.type);

  return (
    <div className="p-4 border-l h-full bg-card flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Configurar Elemento</h2>
        <Button variant="ghost" size="icon" onClick={() => deleteElement(selectedElement.id)} aria-label="Excluir elemento">
            <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <ScrollArea className="flex-grow pr-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="elementName" className="text-xs">Nome do Elemento</Label>
            <Input id="elementName" value={elementName} onChange={handleNameChange} className="h-8 text-xs" placeholder="Ex: Botão Principal"/>
          </div>

          {renderContentInput()}
          
          {(selectedElement.type === 'ul' || selectedElement.type === 'ol' || selectedElement.type === 'li') && (
            <Button onClick={handleAddListItem} variant="outline" size="sm" className="w-full mt-2">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item à Lista
            </Button>
          )}


          <Accordion type="multiple" defaultValue={['attributes', 'layout', 'typography', 'appearance']} className="w-full">
             <AccordionItem value="attributes">
                <AccordionTrigger className="text-sm font-medium py-2">Atributos HTML</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-1">
                    {renderAttributeInputs()}
                    {selectedElement.type === 'img' && (
                        <StylePropertyInput label="Ajuste do Objeto (Object Fit)" propertyName="objectFit" value={localStyles.objectFit} onChange={handleStyleChange} type="select" options={objectFitOptions} placeholder="Selecione o ajuste"/>
                    )}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="layout">
              <AccordionTrigger className="text-sm font-medium py-2">Layout e Espaçamento</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-1">
                <StylePropertyInput label="Largura" propertyName="width" value={localStyles.width} onChange={handleStyleChange} placeholder="auto / 100px / 50%" />
                <StylePropertyInput label="Altura" propertyName="height" value={localStyles.height} onChange={handleStyleChange} placeholder="auto / 100px" />
                <StylePropertyInput label="Preenchimento (Padding)" propertyName="padding" value={localStyles.padding} onChange={handleStyleChange} placeholder="10px ou 10px 20px" />
                <StylePropertyInput label="Margem (Margin)" propertyName="margin" value={localStyles.margin} onChange={handleStyleChange} placeholder="10px ou 0 auto" />
                {(canHaveChildren || selectedElement.type === 'button' || selectedElement.type === 'input' || selectedElement.type === 'textarea' || selectedElement.type === 'p' || selectedElement.type === 'h1' || selectedElement.type === 'h2' || selectedElement.type === 'h3' || selectedElement.type === 'span' || selectedElement.type === 'label' || selectedElement.type === 'a' || selectedElement.type === 'icon' ) && (
                  <>
                    <StylePropertyInput label="Exibição (Display)" propertyName="display" value={localStyles.display} onChange={handleStyleChange} type="select" options={displayOptions} placeholder="Selecione o tipo de display"/>
                    {isFlexOrGrid && (
                      <>
                        <StylePropertyInput label="Alinhar Itens (Align Items)" propertyName="alignItems" value={localStyles.alignItems} onChange={handleStyleChange} type="select" options={alignItemsOptions} placeholder="Alinhar itens"/>
                        <StylePropertyInput label="Justificar Conteúdo (Justify Content)" propertyName="justifyContent" value={localStyles.justifyContent} onChange={handleStyleChange} type="select" options={justifyContentOptions} placeholder="Justificar conteúdo"/>
                      </>
                    )}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="typography">
              <AccordionTrigger className="text-sm font-medium py-2">Tipografia</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-1">
                <StylePropertyInput label="Tamanho da Fonte" propertyName="fontSize" value={localStyles.fontSize} onChange={handleStyleChange} placeholder="16px / 1.2em" />
                <StylePropertyInput label="Cor da Fonte" propertyName="color" value={localStyles.color} onChange={handleStyleChange} type="color" />
                <StylePropertyInput label="Família da Fonte" propertyName="fontFamily" value={localStyles.fontFamily} onChange={handleStyleChange} type="select" options={commonFontFamilies} placeholder="Selecione a fonte"/>
                <StylePropertyInput label="Peso da Fonte" propertyName="fontWeight" value={localStyles.fontWeight} onChange={handleStyleChange} type="select" options={fontWeightOptions} placeholder="Selecione o peso" />
                <StylePropertyInput label="Alinhamento do Texto" propertyName="textAlign" value={localStyles.textAlign} onChange={handleStyleChange} type="select" options={textAlignOptions} placeholder="Selecione o alinhamento"/>
                <StylePropertyInput label="Altura da Linha" propertyName="lineHeight" value={localStyles.lineHeight} onChange={handleStyleChange} placeholder="1.5 / 20px" />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="appearance">
              <AccordionTrigger className="text-sm font-medium py-2">Aparência</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-1">
                <StylePropertyInput label="Cor de Fundo" propertyName="backgroundColor" value={localStyles.backgroundColor} onChange={handleStyleChange} type="color" />
                <StylePropertyInput label="Borda" propertyName="border" value={localStyles.border} onChange={handleStyleChange} placeholder="1px solid #000" />
                <StylePropertyInput label="Raio da Borda" propertyName="borderRadius" value={localStyles.borderRadius} onChange={handleStyleChange} placeholder="5px / 50%" />
                <StylePropertyInput label="Opacidade" propertyName="opacity" value={localStyles.opacity} onChange={handleStyleChange} type="number" placeholder="0.0-1.0" step="0.1" min="0" max="1" />
                 <StylePropertyInput label="Sombra da Caixa (Box Shadow)" propertyName="boxShadow" value={localStyles.boxShadow} onChange={handleStyleChange} placeholder="2px 2px 5px #888" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ai-styling">
              <AccordionTrigger className="text-sm font-medium py-2 flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-accent"/> Estilização com IA (Beta)
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <div>
                  <Label htmlFor="aiPrompt" className="text-xs">Descreva o estilo desejado</Label>
                  <Textarea
                    id="aiPrompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: 'Um botão moderno e limpo com uma leve sombra'"
                    className="mt-1 text-xs"
                    rows={3}
                  />
                </div>
                <Button onClick={handleAiStyleSuggest} disabled={isAiLoading} size="sm" className="w-full">
                  {isAiLoading ? 'Gerando...' : 'Sugerir Estilo com IA'}
                </Button>
                {aiSuggestedCss && (
                  <div className="mt-2 space-y-2">
                    <Label className="text-xs">CSS Sugerido:</Label>
                    <pre className="bg-muted p-2 rounded-md text-xs whitespace-pre-wrap overflow-x-auto max-h-32">
                      <code>{aiSuggestedCss}</code>
                    </pre>
                    <Button onClick={applyAiSuggestedStyle} size="sm" variant="outline" className="w-full">
                      Aplicar Estilo Sugerido
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
