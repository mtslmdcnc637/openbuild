"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { AVAILABLE_ELEMENTS } from '@/lib/constants';
import { DraggableElementItem } from './DraggableElementItem';

export function DraggableElementsPanel() {
  return (
    <div className="h-full p-4 border-r bg-card">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Elements</h2>
      <ScrollArea className="h-[calc(100%-40px)]">
        {AVAILABLE_ELEMENTS.map(item => (
          <DraggableElementItem key={item.type} item={item} />
        ))}
      </ScrollArea>
    </div>
  );
}
