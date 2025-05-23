
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
import { Trash2, Wand2 } from 'lucide-react';

const commonFontFamilies = [
  { label: "System UI", value: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" },
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
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
  { label: 'Justify', value: 'justify' },
];

const fontWeightOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Bold', value: 'bold' },
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
  { label: 'Block', value: 'block' },
  { label: 'Inline Block', value: 'inline-block' },
  { label: 'Flex', value: 'flex' },
  { label: 'Inline Flex', value: 'inline-flex' },
  { label: 'Grid', value: 'grid' },
  { label: 'Inline Grid', value: 'inline-grid' },
  { label: 'None', value: 'none' },
];

const alignItemsOptions = [
  { label: 'Start', value: 'flex-start' },
  { label: 'End', value: 'flex-end' },
  { label: 'Center', value: 'center' },
  { label: 'Baseline', value: 'baseline' },
  { label: 'Stretch', value: 'stretch' },
];

const justifyContentOptions = [
  { label: 'Start', value: 'flex-start' },
  { label: 'End', value: 'flex-end' },
  { label: 'Center', value: 'center' },
  { label: 'Space Between', value: 'space-between' },
  { label: 'Space Around', value: 'space-around' },
  { label: 'Space Evenly', value: 'space-evenly' },
];


export function StyleConfigurationPanel() {
  const { selectedElement, updateElementStyle, updateElementContent, updateElementName, deleteElement, updateElement } = useEditor();
  const [localStyles, setLocalStyles] = useState<CSSProperties>({});
  const [content, setContent] = useState<string>('');
  const [elementName, setElementName] = useState<string>('');
  const [attributes, setAttributes] = useState<Record<string, string | undefined>>({});
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestedCss, setAiSuggestedCss] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      setLocalStyles(selectedElement.styles || {});
      setContent(selectedElement.content || '');
      setElementName(selectedElement.name || `Element ${selectedElement.id.substring(0,4)}`);
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
        <p className="text-sm">Select an element to configure its style.</p>
      </div>
    );
  }

  const handleStyleChange = (property: keyof CSSProperties, value: string) => {
    const newStyles = { ...localStyles, [property]: value };
    setLocalStyles(newStyles); // Update local state immediately for responsiveness
    updateElementStyle(selectedElement.id, newStyles);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setContent(e.target.value);
    updateElementContent(selectedElement.id, e.target.value);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setElementName(e.target.value);
    // Debounce or onBlur might be better for performance
    updateElementName(selectedElement.id, e.target.value);
  };
  
  const handleAttributeChange = (attrName: string, value: string) => {
    const newAttributes = { ...attributes, [attrName]: value };
    setAttributes(newAttributes);
    updateElement(selectedElement.id, { attributes: newAttributes });
  };

  const handleAiStyleSuggest = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "AI Prompt Empty", description: "Please enter a description for the style you want.", variant: "destructive" });
      return;
    }
    setIsAiLoading(true);
    setAiSuggestedCss('');
    try {
      const input: SuggestElementStyleInput = { elementDescription: aiPrompt };
      const result = await suggestElementStyle(input);
      if (result.cssRules) {
        setAiSuggestedCss(result.cssRules);
        toast({ title: "AI Suggestion Received", description: "Review the suggested CSS below." });
      } else {
        toast({ title: "AI Suggestion Failed", description: "The AI could not generate styles for this prompt.", variant: "destructive" });
      }
    } catch (error) {
      console.error("AI style suggestion error:", error);
      toast({ title: "AI Error", description: "An error occurred while fetching AI suggestions.", variant: "destructive" });
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
    toast({ title: "AI Styles Applied", description: "The suggested styles have been applied to the element." });
  };

  const renderContentInput = () => {
    if (['p', 'h1', 'h2', 'h3', 'button', 'span'].includes(selectedElement.type)) {
      return (
        <div className="space-y-1">
          <Label htmlFor="elementContent" className="text-xs">Content</Label>
          <Textarea
            id="elementContent"
            value={content}
            onChange={handleContentChange}
            placeholder="Enter text content..."
            className="text-xs"
          />
        </div>
      );
    }
    return null;
  };
  
  const renderAttributeInputs = () => {
    if (selectedElement.type === 'img') {
      return (
        <>
          <div className="space-y-1">
            <Label htmlFor="imgSrc" className="text-xs">Image Source (URL)</Label>
            <Input
              id="imgSrc"
              type="url"
              value={attributes.src || ''}
              onChange={(e) => handleAttributeChange('src', e.target.value)}
              placeholder="https://example.com/image.png"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="imgAlt" className="text-xs">Alt Text</Label>
            <Input
              id="imgAlt"
              type="text"
              value={attributes.alt || ''}
              onChange={(e) => handleAttributeChange('alt', e.target.value)}
              placeholder="Descriptive text for image"
              className="h-8 text-xs"
            />
          </div>
        </>
      );
    }
    return null;
  };

  const isFlexOrGrid = localStyles.display === 'flex' || localStyles.display === 'grid' || localStyles.display === 'inline-flex' || localStyles.display === 'inline-grid';

  return (
    <div className="p-4 border-l h-full bg-card flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Configure</h2>
        <Button variant="ghost" size="icon" onClick={() => deleteElement(selectedElement.id)} aria-label="Delete element">
            <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <ScrollArea className="flex-grow pr-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="elementName" className="text-xs">Element Name</Label>
            <Input id="elementName" value={elementName} onChange={handleNameChange} className="h-8 text-xs" />
          </div>

          {renderContentInput()}
          {renderAttributeInputs()}

          <Accordion type="multiple" defaultValue={['layout', 'typography', 'appearance']} className="w-full">
            <AccordionItem value="layout">
              <AccordionTrigger className="text-sm font-medium py-2">Layout & Spacing</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-1">
                <StylePropertyInput label="Width" propertyName="width" value={localStyles.width} onChange={handleStyleChange} placeholder="auto / 100px / 50%" />
                <StylePropertyInput label="Height" propertyName="height" value={localStyles.height} onChange={handleStyleChange} placeholder="auto / 100px" />
                <StylePropertyInput label="Padding" propertyName="padding" value={localStyles.padding} onChange={handleStyleChange} placeholder="10px or 10px 20px" />
                <StylePropertyInput label="Margin" propertyName="margin" value={localStyles.margin} onChange={handleStyleChange} placeholder="10px or 0 auto" />
                {selectedElement.type === 'div' && (
                  <>
                    <StylePropertyInput label="Display" propertyName="display" value={localStyles.display} onChange={handleStyleChange} type="select" options={displayOptions} placeholder="Select display type"/>
                    {isFlexOrGrid && (
                      <>
                        <StylePropertyInput label="Align Items" propertyName="alignItems" value={localStyles.alignItems} onChange={handleStyleChange} type="select" options={alignItemsOptions} placeholder="Align items"/>
                        <StylePropertyInput label="Justify Content" propertyName="justifyContent" value={localStyles.justifyContent} onChange={handleStyleChange} type="select" options={justifyContentOptions} placeholder="Justify content"/>
                        {/* Add more flex/grid properties like flexDirection, flexWrap, gap etc. as needed */}
                      </>
                    )}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="typography">
              <AccordionTrigger className="text-sm font-medium py-2">Typography</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-1">
                <StylePropertyInput label="Font Size" propertyName="fontSize" value={localStyles.fontSize} onChange={handleStyleChange} placeholder="16px / 1.2em" />
                <StylePropertyInput label="Font Color" propertyName="color" value={localStyles.color} onChange={handleStyleChange} type="color" />
                <StylePropertyInput label="Font Family" propertyName="fontFamily" value={localStyles.fontFamily} onChange={handleStyleChange} type="select" options={commonFontFamilies} placeholder="Select font"/>
                <StylePropertyInput label="Font Weight" propertyName="fontWeight" value={localStyles.fontWeight} onChange={handleStyleChange} type="select" options={fontWeightOptions} placeholder="Select weight" />
                <StylePropertyInput label="Text Align" propertyName="textAlign" value={localStyles.textAlign} onChange={handleStyleChange} type="select" options={textAlignOptions} placeholder="Select alignment"/>
                <StylePropertyInput label="Line Height" propertyName="lineHeight" value={localStyles.lineHeight} onChange={handleStyleChange} placeholder="1.5 / 20px" />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="appearance">
              <AccordionTrigger className="text-sm font-medium py-2">Appearance</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-1">
                <StylePropertyInput label="Background Color" propertyName="backgroundColor" value={localStyles.backgroundColor} onChange={handleStyleChange} type="color" />
                <StylePropertyInput label="Border" propertyName="border" value={localStyles.border} onChange={handleStyleChange} placeholder="1px solid #000" />
                <StylePropertyInput label="Border Radius" propertyName="borderRadius" value={localStyles.borderRadius} onChange={handleStyleChange} placeholder="5px / 50%" />
                <StylePropertyInput label="Opacity" propertyName="opacity" value={localStyles.opacity} onChange={handleStyleChange} type="number" placeholder="0.0-1.0" step="0.1" min="0" max="1" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ai-styling">
              <AccordionTrigger className="text-sm font-medium py-2 flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-accent"/> AI Styling (Beta)
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <div>
                  <Label htmlFor="aiPrompt" className="text-xs">Describe the style</Label>
                  <Textarea
                    id="aiPrompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., 'A modern, clean button with a slight shadow'"
                    className="mt-1 text-xs"
                    rows={3}
                  />
                </div>
                <Button onClick={handleAiStyleSuggest} disabled={isAiLoading} size="sm" className="w-full">
                  {isAiLoading ? 'Generating...' : 'Suggest Style with AI'}
                </Button>
                {aiSuggestedCss && (
                  <div className="mt-2 space-y-2">
                    <Label className="text-xs">Suggested CSS:</Label>
                    <pre className="bg-muted p-2 rounded-md text-xs whitespace-pre-wrap overflow-x-auto max-h-32">
                      <code>{aiSuggestedCss}</code>
                    </pre>
                    <Button onClick={applyAiSuggestedStyle} size="sm" variant="outline" className="w-full">
                      Apply Suggested Style
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

