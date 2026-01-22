'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative">
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="min-h-hero flex flex-col justify-center py-16 md:py-20">
          <div className="max-w-3xl">
            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-5 leading-[1.1] tracking-tighter">
              <span className="text-text-primary">Discover, Trade, and Collect</span>
              <br />
              <span className="text-brand-primary">NFTs on Klever Chain</span>
            </h1>

            <p className="text-base md:text-lg text-text-muted mb-8 max-w-xl leading-relaxed">
              Join the ultimate NFT marketplace powered by Rare Canvas.
            </p>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-3">
              <Link href="/nft/collections">
                <button className="h-10 px-5 bg-bg-inverse hover:bg-bg-inverse text-bg-base text-sm font-medium rounded-lg transition-colors duration-150">
                  Explore Collections
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
