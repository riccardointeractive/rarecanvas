import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost, BlogCategory } from '@/app/blog/types/blog.types';

// ═══════════════════════════════════════════════════════════
// CONTENT LOADER - Blog Markdown Integration
// ═══════════════════════════════════════════════════════════
// Reads markdown files from content/blog/ directory
// Parses frontmatter and returns typed data
//
// NOTE: Updates are now in src/app/updates/config/updates.config.ts
//       Roadmap is no longer used from markdown files

const contentDir = path.join(process.cwd(), 'content');

/**
 * Markdown to HTML converter
 * Handles standard markdown syntax
 */
function simpleMarkdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';
  let listItems: string[] = [];
  
  const flushList = () => {
    if (listItems.length > 0) {
      result.push('<ul>' + listItems.join('') + '</ul>');
      listItems = [];
    }
  };
  
  const processInline = (text: string): string => {
    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return text;
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    
    // Code block start/end
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
        codeBlockContent = [];
      } else {
        result.push(`<pre><code class="language-${codeBlockLang}">${codeBlockContent.join('\n')}</code></pre>`);
        inCodeBlock = false;
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // Empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }
    
    // Headers
    if (line.startsWith('## ')) {
      flushList();
      result.push(`<h2>${processInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      flushList();
      result.push(`<h3>${processInline(line.slice(4))}</h3>`);
      continue;
    }
    
    // List items
    if (line.match(/^[-*]\s+/)) {
      const content = line.replace(/^[-*]\s+/, '');
      listItems.push(`<li>${processInline(content)}</li>`);
      continue;
    }
    
    // Regular paragraph
    flushList();
    result.push(`<p>${processInline(line)}</p>`);
  }
  
  flushList();
  return result.join('\n');
}

/**
 * Get all blog posts
 * Sorted by date (newest first)
 */
export function getBlogPosts(): BlogPost[] {
  const blogDir = path.join(contentDir, 'blog');
  
  if (!fs.existsSync(blogDir)) {
    console.warn('Blog directory not found, returning empty array');
    return [];
  }

  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  
  if (files.length === 0) {
    return [];
  }

  const posts = files.map(filename => {
    const filepath = path.join(blogDir, filename);
    const fileContents = fs.readFileSync(filepath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Format date to readable format
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    
    // Get slug from filename (remove .md extension)
    const slug = filename.replace(/\.md$/, '');
    
    return {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      date: formatDate(data.date),
      readTime: data.readTime || '5 min read',
      category: data.category as BlogCategory,
      featured: data.featured || false,
      coverImage: data.coverImage,
      content: content, // Raw markdown, will be processed on post page
    };
  });

  // Sort by date (newest first)
  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get a single blog post by slug with HTML content
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const blogDir = path.join(contentDir, 'blog');
  const filepath = path.join(blogDir, `${slug}.md`);
  
  if (!fs.existsSync(filepath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filepath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Convert markdown to HTML
  const htmlContent = simpleMarkdownToHtml(content);
  
  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    date: formatDate(data.date),
    readTime: data.readTime || '5 min read',
    category: data.category as BlogCategory,
    featured: data.featured || false,
    coverImage: data.coverImage,
    content: htmlContent,
  };
}

/**
 * Get all blog post slugs for static generation
 */
export function getBlogPostSlugs(): string[] {
  const blogDir = path.join(contentDir, 'blog');
  
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  return files.map(filename => filename.replace(/\.md$/, ''));
}