/**
 * Blog Types
 * Type definitions for blog posts and related data
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: BlogCategory;
  featured?: boolean;
  coverImage?: string;
  content: string;
}

export type BlogCategory = 'development' | 'ecosystem' | 'updates' | 'tutorials';

export interface CategoryStyle {
  bg: string;
  border: string;
  text: string;
  label: string;
}

export type CategoryStyles = Record<BlogCategory, CategoryStyle>;
