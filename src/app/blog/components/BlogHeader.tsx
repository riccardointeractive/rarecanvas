/**
 * BlogHeader Component
 * Page header for the blog section
 */

export function BlogHeader() {
  return (
    <header className="mb-10 md:mb-12">
      <h1 className="text-2xl md:text-3xl font-medium text-text-primary mb-3">
        Blog
      </h1>
      <p className="text-sm md:text-base text-text-secondary max-w-2xl">
        Thoughts on building decentralized applications, the Klever ecosystem, and the future of Web3.
      </p>
    </header>
  );
}
