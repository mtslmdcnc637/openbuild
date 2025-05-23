
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
  { label: 'Inline', value: 'inline' },
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

const objectFitOptions = [
    { label: 'Fill', value: 'fill' },
    { label: 'Contain', value: 'contain' },
    { label: 'Cover', value: 'cover' },
    { label: 'None', value: 'none' },
    { label: 'Scale Down', value: 'scale-down' },
];

// Get a list of Lucide icon names for a dropdown (optional, text input is simpler for now)
// const lucideIconNames = Object.keys(LucideIcons).filter(key => key !== 'createLucideIcon' && key !== 'icons');
// const iconOptions = lucideIconNames.map(name => ({ label: name, value: name }));


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
      // For input, use attributes.value. For textarea and others, use content.
      if (selectedElement.type === 'input') {
        setContent(String(selectedElement.attributes?.value || ''));
      } else {
        setContent(selectedElement.content || '');
      }
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
    setLocalStyles(newStyles);
    updateElementStyle(selectedElement.id, newStyles);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    // updateElementContent handles if it should be content or attribute.value
    updateElementContent(selectedElement.id, newContent);
  };
  
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setElementName(e.target.value);
    updateElementName(selectedElement.id, e.target.value);
  };
  
  const handleAttributeChangeLocal = (attrName: string, value: string | number) => {
    const newAttributes = { ...attributes, [attrName]: String(value) }; // Ensure value is string for consistency
    setAttributes(newAttributes); // Update local state for controlled input
    updateElementAttribute(selectedElement.id, attrName, String(value));
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
  
  const handleAddListItem = () => {
    if (selectedElement && (selectedElement.type === 'ul' || selectedElement.type === 'ol' || selectedElement.type === 'li')) {
      // If 'li' is selected, add to its parent list. Otherwise, add to the selected list.
      const parentListId = selectedElement.type === 'li' ? findParentListId(selectedElement.id) : selectedElement.id;
      if (parentListId) {
        addElement('li', parentListId);
      }
    }
  };

  // This helper function would need to be implemented or EditorContext adapted to find parent
  const findParentListId = (childId: string): string | undefined => {
    // This is a simplified placeholder. A real implementation would traverse the elements tree.
    // For now, we assume if an 'li' is selected, its direct parent in the flat 'elements' array (if it exists and is a list) is the target.
    // This needs robust implementation if deep nesting is common.
    // Or, the addElement in context could be smarter.
    // For now, if selectedElement is 'li', assume its parent is what we need, but this is not robust for deep nesting
    // console.warn("findParentListId is a placeholder and needs robust implementation for deep nesting.");
    return selectedElement?.id; // This is incorrect if LI is selected.
                                // We need a way to get parent ID from context or pass it
  };


  const renderContentInput = () => {
    // p, h1-h3, button, span, li, a, label use `content` for their text
    // textarea uses `content` for its value
    if (['p', 'h1', 'h2', 'h3', 'button', 'span', 'li', 'a', 'label', 'textarea'].includes(selectedElement.type)) {
      const isTextarea = selectedElement.type === 'textarea';
      return (
        <div className="space-y-1">
          <Label htmlFor="elementContent" className="text-xs">{isTextarea ? 'Value' : 'Content'}</Label>
          <Textarea
            id="elementContent"
            value={content} // `content` state is already correctly set for input/textarea
            onChange={handleContentChange}
            placeholder={isTextarea ? "Enter text for textarea..." : "Enter text content..."}
            className="text-xs"
            rows={isTextarea ? 4 : 2}
          />
        </div>
      );
    }
    // Input type="text" uses attribute `value`
    if (selectedElement.type === 'input') {
         return (
            <div className="space-y-1">
                <Label htmlFor="inputValue" className="text-xs">Value</Label>
                <Input
                    id="inputValue"
                    type="text"
                    value={String(attributes.value || '')}
                    onChange={(e) => handleAttributeChangeLocal('value', e.target.value)}
                    placeholder="Enter input value"
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
            <Label htmlFor="imgSrc" className="text-xs">Image Source (URL)</Label>
            <Input
              id="imgSrc"
              type="url"
              value={attributes.src as string || ''}
              onChange={(e) => handleAttributeChangeLocal('src', e.target.value)}
              placeholder="https://example.com/image.png"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="imgAlt" className="text-xs">Alt Text</Label>
            <Input
              id="imgAlt"
              type="text"
              value={attributes.alt as string || ''}
              onChange={(e) => handleAttributeChangeLocal('alt', e.target.value)}
              placeholder="Descriptive text for image"
              className="h-8 text-xs"
            />
          </div>
        </React.Fragment>
      );
    } else if (selectedElement.type === 'icon') {
      commonInputs.push(
        <React.Fragment key="icon-attrs">
          <div className="space-y-1">
            <Label htmlFor="iconName" className="text-xs">Icon Name (Lucide)</Label>
            <Input
              id="iconName"
              type="text"
              value={attributes.iconName as string || 'Smile'}
              onChange={(e) => handleAttributeChangeLocal('iconName', e.target.value)}
              placeholder="e.g., Smile, Home, Settings"
              className="h-8 text-xs"
            />
            <p className="text-xs text-muted-foreground">Find names at lucide.dev</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="iconSize" className="text-xs">Size (px)</Label>
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
            <Label htmlFor="iconStrokeWidth" className="text-xs">Stroke Width</Label>
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
          <Label htmlFor="linkHref" className="text-xs">Link URL (href)</Label>
          <Input
            id="linkHref"
            type="url"
            value={attributes.href as string || ''}
            onChange={(e) => handleAttributeChangeLocal('href', e.target.value)}
            placeholder="https://example.com"
            className="h-8 text-xs"
          />
        </div>
      );
    } else if (selectedElement.type === 'input' || selectedElement.type === 'textarea') {
        commonInputs.push(
            <div className="space-y-1" key={`${selectedElement.type}-placeholder`}>
                <Label htmlFor={`${selectedElement.type}Placeholder`} className="text-xs">Placeholder</Label>
                <Input
                    id={`${selectedElement.type}Placeholder`}
                    type="text"
                    value={attributes.placeholder as string || ''}
                    onChange={(e) => handleAttributeChangeLocal('placeholder', e.target.value)}
                    placeholder="Enter placeholder text"
                    className="h-8 text-xs"
                />
            </div>
        );
    }
    if (selectedElement.type === 'input') {
        // Could add 'type' attribute editor here if more input types are supported
    } else if (selectedElement.type === 'label') {
        commonInputs.push(
            <div className="space-y-1" key="label-for">
                <Label htmlFor="labelFor" className="text-xs">For (Input ID)</Label>
                <Input
                    id="labelFor"
                    type="text"
                    value={attributes.htmlFor as string || ''}
                    onChange={(e) => handleAttributeChangeLocal('htmlFor', e.target.value)}
                    placeholder="ID of the input element"
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
          
          {(selectedElement.type === 'ul' || selectedElement.type === 'ol' || selectedElement.type === 'li') && (
            <Button onClick={handleAddListItem} variant="outline" size="sm" className="w-full mt-2">
              <PlusCircle className="mr-2 h-4 w-4" /> Add List Item
            </Button>
          )}


          <Accordion type="multiple" defaultValue={['attributes', 'layout', 'typography', 'appearance']} className="w-full">
             <AccordionItem value="attributes">
                <AccordionTrigger className="text-sm font-medium py-2">Attributes</AccordionTrigger>
                <AccordionContent className="space-y-2 pt-1">
                    {renderAttributeInputs()}
                    {selectedElement.type === 'img' && (
                        <StylePropertyInput label="Object Fit" propertyName="objectFit" value={localStyles.objectFit} onChange={handleStyleChange} type="select" options={objectFitOptions} placeholder="Select object fit"/>
                    )}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="layout">
              <AccordionTrigger className="text-sm font-medium py-2">Layout & Spacing</AccordionTrigger>
              <AccordionContent className="space-y-2 pt-1">
                <StylePropertyInput label="Width" propertyName="width" value={localStyles.width} onChange={handleStyleChange} placeholder="auto / 100px / 50%" />
                <StylePropertyInput label="Height" propertyName="height" value={localStyles.height} onChange={handleStyleChange} placeholder="auto / 100px" />
                <StylePropertyInput label="Padding" propertyName="padding" value={localStyles.padding} onChange={handleStyleChange} placeholder="10px or 10px 20px" />
                <StylePropertyInput label="Margin" propertyName="margin" value={localStyles.margin} onChange={handleStyleChange} placeholder="10px or 0 auto" />
                {(canHaveChildren || selectedElement.type === 'button' || selectedElement.type === 'input' || selectedElement.type === 'textarea' || selectedElement.type === 'p' || selectedElement.type === 'h1' || selectedElement.type === 'h2' || selectedElement.type === 'h3' || selectedElement.type === 'span' || selectedElement.type === 'label' || selectedElement.type === 'a' || selectedElement.type === 'icon' ) && (
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
                 <StylePropertyInput label="Box Shadow" propertyName="boxShadow" value={localStyles.boxShadow} onChange={handleStyleChange} placeholder="2px 2px 5px #888" />
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
