
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CSSProperties } from 'react';

type StylePropertyInputProps = {
  label: string;
  propertyName: keyof CSSProperties;
  value: string | number | undefined;
  onChange: (property: keyof CSSProperties, value: string) => void;
  type?: 'text' | 'color' | 'number' | 'select';
  options?: { label: string; value: string }[];
  placeholder?: string;
  unit?: string; // e.g., 'px', '%'
};

export function StylePropertyInput({
  label,
  propertyName,
  value,
  onChange,
  type = 'text',
  options,
  placeholder,
  unit,
}: StylePropertyInputProps) {
  const id = `style-${propertyName}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let newValue = e.target.value;
    if (type === 'number' && unit && newValue) {
      newValue = `${newValue}${unit}`;
    }
    onChange(propertyName, newValue);
  };

  const handleSelectChange = (selectValue: string) => {
    onChange(propertyName, selectValue);
  }

  const displayValue = typeof value === 'string' && unit ? value.replace(unit, '') : value;

  return (
    <div className="grid grid-cols-2 items-center gap-2">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {type === 'select' && options ? (
        <Select value={value as string || ""} onValueChange={handleSelectChange}>
          <SelectTrigger id={id} className="h-8 text-xs">
            <SelectValue placeholder={placeholder || `Selecione ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={type}
          value={unit ? (displayValue ?? '') : (value ?? '')}
          onChange={handleChange}
          placeholder={placeholder}
          className="h-8 text-xs"
          {...(type === 'color' && { className: "h-8 w-full p-0.5 border-none" })}
        />
      )}
    </div>
  );
}
