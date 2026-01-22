import { BlogPost, CategoryStyles } from '../types/blog.types';

/**
 * BlogPostContent Component
 * Displays full blog post content
 */

interface BlogPostContentProps {
  post: BlogPost;
  categoryStyles: CategoryStyles;
}

export function BlogPostContent({ post, categoryStyles }: BlogPostContentProps) {
  const style = categoryStyles[post.category];
  
  return (
    <article className="max-w-3xl mx-auto">
      {/* Post Header */}
      <header className="mb-10">
        {/* Category and Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
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
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-text-primary mb-4">
          {post.title}
        </h1>

        {/* Excerpt as subtitle */}
        <p className="text-lg text-text-secondary leading-relaxed">
          {post.excerpt}
        </p>
      </header>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

      {/* Content */}
      <div 
        className="
          [&>h2]:text-xl [&>h2]:font-medium [&>h2]:text-text-primary [&>h2]:mt-10 [&>h2]:mb-4
          [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-text-primary [&>h3]:mt-8 [&>h3]:mb-3
          [&>p]:text-text-secondary [&>p]:leading-relaxed [&>p]:mb-4
          [&>ul]:my-4 [&>ul]:space-y-2
          [&>ul>li]:text-text-secondary [&>ul>li]:pl-4 [&>ul>li]:relative
          [&>ul>li]:before:content-[''] [&>ul>li]:before:absolute [&>ul>li]:before:left-0 [&>ul>li]:before:top-[0.6em] [&>ul>li]:before:w-1.5 [&>ul>li]:before:h-1.5 [&>ul>li]:before:bg-brand-primary/60 [&>ul>li]:before:rounded-full
          [&_strong]:text-text-primary [&_strong]:font-medium
          [&_a]:text-brand-primary [&_a]:hover:underline
          [&_code]:text-brand-primary [&_code]:bg-overlay-default [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
          [&>pre]:bg-bg-surface [&>pre]:border [&>pre]:border-border-default [&>pre]:rounded-xl [&>pre]:p-4 [&>pre]:my-6 [&>pre]:overflow-x-auto
          [&>pre_code]:bg-transparent [&>pre_code]:p-0 [&>pre_code]:text-text-primary
        "
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
