'use client';

import { TemplateField } from '../types/social-media.types';

interface TemplateFieldsProps {
  fields: TemplateField[];
  values: Record<string, string | number>;
  onChange: (fieldId: string, value: string | number) => void;
}

export function TemplateFields({ fields, values, onChange }: TemplateFieldsProps) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-text-secondary">Content</label>
      
      {fields.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <label className="text-xs text-text-muted">
            {field.label}
            {field.required && <span className="text-error ml-1">*</span>}
          </label>
          
          {field.type === 'text' && (
            <input
              type="text"
              value={values[field.id] || field.defaultValue || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2.5 rounded-xl bg-overlay-subtle border border-border-default text-text-primary text-sm placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          )}
          
          {field.type === 'number' && (
            <input
              type="number"
              value={values[field.id] || field.defaultValue || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2.5 rounded-xl bg-overlay-subtle border border-border-default text-text-primary text-sm placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />
          )}
          
          {field.type === 'select' && (
            <select
              value={values[field.id] || field.defaultValue || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-overlay-subtle border border-border-default text-text-primary text-sm focus:outline-none focus:border-brand-primary/50 transition-colors cursor-pointer"
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#1a1a20]">
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
