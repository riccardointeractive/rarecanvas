'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'tsx', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-bg-surface rounded-xl border border-border-default overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-border-default flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">{title}</span>
          <span className="text-xs text-text-muted font-mono">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-info font-mono">{code}</code>
        </pre>
        <button
          onClick={copyCode}
          className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-overlay-subtle hover:bg-overlay-default border border-border-default text-xs text-text-secondary hover:text-text-primary transition-all"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
