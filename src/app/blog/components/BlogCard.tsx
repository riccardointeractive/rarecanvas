import Link from 'next/link';
import { BlogPost, CategoryStyles } from '../types/blog.types';

/**
 * BlogCard Component
 * Displays a blog post preview using FeatureLinkCard pattern
 */

interface BlogCardProps {
  post: BlogPost;
  categoryStyles: CategoryStyles;
}

export function BlogCard({ post, categoryStyles }: BlogCardProps) {
  const style = categoryStyles[post.category];
  
  return (
    <Link href={`/blog/${post.slug}`} className="group block bg-bg-surface hover:bg-bg-elevated border border-border-default hover:border-border-hover rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8 transition-all duration-150">
      <div className="flex flex-col gap-3">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-2 py-0.5 text-2xs font-medium tracking-wider uppercase rounded ${style.bg} ${style.border} border ${style.text}`}>
            {style.label}
          </span>
          <span className="text-sm text-text-muted">
            {post.date}
          </span>
          <span className="text-sm text-text-muted">
            · {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-medium text-text-primary group-hover:text-brand-primary transition-colors duration-150">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          {post.excerpt}
        </p>

        {/* Read link */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-brand-primary mt-2">
          <span>Read article</span>
          <svg className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
