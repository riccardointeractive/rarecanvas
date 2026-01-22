/**
 * Blog Configuration
 * Category styles and display settings
 */

import { CategoryStyles } from '../types/blog.types';

export const categoryStyles: CategoryStyles = {
  development: {
    bg: 'bg-info-muted',
    border: 'border-border-info',
    text: 'text-info',
    label: 'Development',
  },
  ecosystem: {
    bg: 'bg-brand-primary/10',
    border: 'border-border-brand',
    text: 'text-brand-primary',
    label: 'Ecosystem',
  },
  updates: {
    bg: 'bg-success-muted',
    border: 'border-border-success',
    text: 'text-success',
    label: 'Updates',
  },
  tutorials: {
    bg: 'bg-info-muted',
    border: 'border-border-info',
    text: 'text-info',
    label: 'Tutorials',
  },
};
