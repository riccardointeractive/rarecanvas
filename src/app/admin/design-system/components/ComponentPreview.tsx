'use client';

import { ReactNode, useState } from 'react';
import { CodeBlock } from './CodeBlock';

interface ComponentPreviewProps {
  title: string;
  description?: string;
  code: string;
  children: ReactNode;
  centered?: boolean;
}

export function ComponentPreview({ title, description, code, children, centered = false }: ComponentPreviewProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="mb-8">
      {/* Title & Description */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-text-primary mb-1">{title}</h4>
        {description && <p className="text-sm text-text-secondary">{description}</p>}
      </div>

      {/* Preview */}
      <div className={`rounded-2xl border border-border-default p-8 mb-3 bg-bg-base ${centered ? 'flex items-center justify-center' : ''}`}>
        {children}
      </div>

      {/* Show Code Button */}
      <button
        onClick={() => setShowCode(!showCode)}
        className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 mb-3"
      >
        <svg className={`w-4 h-4 transition-transform ${showCode ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {showCode ? 'Hide' : 'Show'} Code
      </button>

      {/* Code Block */}
      {showCode && <CodeBlock code={code} />}
    </div>
  );
}
