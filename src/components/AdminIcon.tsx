'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function AdminIcon() {
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    // Check if we're on localhost
    const hostname = window.location.hostname;
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
  }, []);

  // Don't render anything if not on localhost
  if (!isLocalhost) return null;

  return (
    <Link 
      href="/admin" 
      className="relative group ml-2"
      title="Admin Panel (localhost only)"
    >
      {/* Gear Icon */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-text-muted group-hover:text-brand-primary transition-all duration-150 group-hover:rotate-90"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m9.66-9.66l-4.24 4.24m-6.36 6.36L6.82 14.7M23 12h-6m-6 0H1m20.66 9.66l-4.24-4.24m-6.36-6.36L6.82 9.3" />
        </svg>
        
        {/* Glow effect on hover */}
        <span className="absolute inset-0 rounded-full bg-brand-primary/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-150" />
      </div>
      
      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-2xs font-medium text-text-primary bg-gray-900 border border-border-default rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150-micro whitespace-nowrap pointer-events-none">
        Admin
      </span>
    </Link>
  );
}