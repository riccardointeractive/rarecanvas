'use client';

import { TemplateType } from '../types/social-media.types';
import { TEMPLATES } from '../config/social-media.config';
import {
  ArrowLeftRight,
  Percent,
  ListPlus,
  Megaphone,
  Trophy,
  Flag,
} from 'lucide-react';

interface TemplateSelectorProps {
  selected: TemplateType;
  onSelect: (template: TemplateType) => void;
}

const TEMPLATE_ICONS: Record<TemplateType, React.ReactNode> = {
  'new-pair': <ArrowLeftRight className="w-5 h-5" />,
  'apr-promotion': <Percent className="w-5 h-5" />,
  'listing': <ListPlus className="w-5 h-5" />,
  'announcement': <Megaphone className="w-5 h-5" />,
  'milestone': <Trophy className="w-5 h-5" />,
  'season-announcement': <Flag className="w-5 h-5" />,
};

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-text-secondary">Template</label>
      <div className="grid grid-cols-1 gap-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`
              flex items-start gap-3 p-3 rounded-xl border transition-all text-left
              ${selected === template.id
                ? 'bg-brand-primary/20 border-brand-primary text-text-primary'
                : 'bg-overlay-subtle border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary'
              }
            `}
          >
            <div className={`
              p-2 rounded-lg flex-shrink-0
              ${selected === template.id ? 'bg-brand-primary/30' : 'bg-overlay-subtle'}
            `}>
              {TEMPLATE_ICONS[template.id]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-text-muted truncate">{template.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
