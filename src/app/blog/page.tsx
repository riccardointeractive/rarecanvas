import { getBlogPosts } from '@/lib/content';
import { categoryStyles } from './config/blog.config';
import { SectionTitle, IconBox } from '@/components/ui';
import Link from 'next/link';

/**
 * Blog Page
 *
 * Displays all blog posts with Rare Canvas design language.
 */

export const metadata = {
  title: 'Blog | Rare Canvas',
  description: 'Thoughts on building decentralized applications, the Klever ecosystem, and the future of Web3.',
};

// Blog icon
const BlogIcon = (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export default function BlogPage() {
  const posts = getBlogPosts();
  
  return (
    <div className="relative overflow-hidden">
      {/* Subtle background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-bg-base" />
        <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-dashboard mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        
        {/* Header */}
        <SectionTitle 
          title="Blog"
          description="Thoughts on building decentralized applications, the Klever ecosystem, and the future of Web3."
        />

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {posts.map((post) => {
              const style = categoryStyles[post.category];
              return (
                <Link 
                  key={post.slug} 
                  href={`/blog/${post.slug}`}
                  className="group block bg-bg-surface hover:bg-bg-elevated border border-border-default hover:border-border-hover rounded-2xl md:rounded-3xl p-6 md:p-8 transition-all duration-150"
                >
                  <div className="flex items-start gap-4 md:gap-5">
                    <IconBox icon={BlogIcon} variant="blue" size="lg" />
                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 text-2xs font-medium tracking-wider uppercase rounded ${style.bg} ${style.border} border ${style.text}`}>
                          {style.label}
                        </span>
                        <span className="text-xs text-text-muted">{post.date}</span>
                        <span className="text-xs text-text-muted">· {post.readTime}</span>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-lg font-medium text-text-primary group-hover:text-brand-primary transition-colors duration-150 mb-3">
                        {post.title}
                      </h2>
                      
                      {/* Excerpt */}
                      <p className="text-sm md:text-base text-text-secondary leading-relaxed line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      
                      {/* Read link */}
                      <div className="flex items-center gap-2 text-xs md:text-sm text-brand-primary">
                        <span>Read article</span>
                        <svg className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="glass rounded-4xl p-12 md:p-20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
              <div className="text-brand-primary">{BlogIcon}</div>
            </div>
            <h3 className="text-xl font-medium text-text-primary mb-3">No articles yet</h3>
            <p className="text-text-secondary">Check back soon for insights on building in Web3.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
