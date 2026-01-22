import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPostSlugs } from '@/lib/content';
import { categoryStyles } from '../config/blog.config';

/**
 * Dynamic Blog Post Page
 * Premium reading experience with Rare Canvas design language
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const slugs = getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Not Found | Rare Canvas Blog' };
  }

  return {
    title: `${post.title} | Rare Canvas Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  const style = categoryStyles[post.category];

  return (
    <div className="relative overflow-hidden">
      {/* Subtle background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-bg-base" />
        <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-dashboard mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        
        {/* Article Container */}
        <article className="max-w-3xl mx-auto">
          
          {/* Header */}
          <header className="mb-12 md:mb-16">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-2.5 py-1 text-2xs font-medium tracking-wider uppercase rounded ${style.bg} ${style.border} border ${style.text}`}>
                {style.label}
              </span>
              <span className="text-sm text-text-muted">{post.date}</span>
              <span className="text-sm text-text-muted">· {post.readTime}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-text-primary mb-6">
              {post.title}
            </h1>

            {/* Subtitle/Excerpt */}
            <p className="text-xl text-text-secondary leading-relaxed">
              {post.excerpt}
            </p>
          </header>

          {/* Divider */}
          <div className="relative mb-12 md:mb-16">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            <div className="relative flex justify-center">
              <div className="w-2 h-2 rounded-full bg-brand-primary" />
            </div>
          </div>

          {/* Content - clean reading experience */}
          <div 
            className="
              [&>h2]:text-2xl [&>h2]:font-medium [&>h2]:text-text-primary [&>h2]:mt-14 [&>h2]:mb-6 [&>h2]:first:mt-0
              [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-text-primary [&>h3]:mt-10 [&>h3]:mb-4
              [&>p]:text-text-primary/80 [&>p]:leading-[1.85] [&>p]:mb-6 [&>p]:text-[17px]
              [&>ul]:my-6 [&>ul]:space-y-3
              [&>ul>li]:text-text-primary/80 [&>ul>li]:leading-[1.75] [&>ul>li]:pl-6 [&>ul>li]:relative
              [&>ul>li]:before:content-[''] [&>ul>li]:before:absolute [&>ul>li]:before:left-0 [&>ul>li]:before:top-[0.5em] [&>ul>li]:before:w-2 [&>ul>li]:before:h-2 [&>ul>li]:before:bg-brand-primary [&>ul>li]:before:rounded-full
              [&_strong]:text-text-primary [&_strong]:font-semibold
              [&_a]:text-brand-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-text-primary [&_a]:transition-colors
              [&_code]:text-brand-primary [&_code]:bg-brand-primary/10 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-md [&_code]:text-[15px] [&_code]:font-mono
              [&>pre]:bg-bg-base [&>pre]:border [&>pre]:border-border-default [&>pre]:rounded-2xl [&>pre]:p-6 [&>pre]:my-8 [&>pre]:overflow-x-auto
              [&>pre_code]:bg-transparent [&>pre_code]:p-0 [&>pre_code]:text-text-primary [&>pre_code]:text-sm
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

        </article>
        
      </div>
    </div>
  );
}
