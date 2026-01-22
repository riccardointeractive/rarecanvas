import { NextRequest, NextResponse } from 'next/server';

/**
 * Allowed domains for image proxying
 * Add domains as needed for legitimate image sources
 */
const ALLOWED_DOMAINS = [
  'kleverscan.org',
  'klever.io',
  'klever.finance',
  'api.mainnet.klever.org',
  'api.testnet.klever.org',
  'raw.githubusercontent.com',
  'ipfs.io',
  'cloudflare-ipfs.com',
  'nftstorage.link',
];

/**
 * Check if URL is safe to proxy
 */
function isUrlSafe(urlString: string): { safe: boolean; error?: string } {
  try {
    const url = new URL(urlString);
    
    // Block non-HTTPS (except for localhost in dev)
    if (url.protocol !== 'https:') {
      return { safe: false, error: 'Only HTTPS URLs allowed' };
    }
    
    // Block internal/private IP ranges
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.2') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.startsWith('169.254.') ||
      hostname.startsWith('0.') ||
      hostname === '[::1]' ||
      hostname.includes('internal') ||
      hostname.includes('metadata') ||
      hostname.endsWith('.local')
    ) {
      return { safe: false, error: 'Internal URLs not allowed' };
    }
    
    // Whitelist check
    const isDomainAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    if (!isDomainAllowed) {
      return { safe: false, error: 'Domain not in allowlist' };
    }
    
    return { safe: true };
  } catch {
    return { safe: false, error: 'Invalid URL format' };
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  // 🔒 SECURITY: Validate URL before fetching
  const validation = isUrlSafe(url);
  if (!validation.safe) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Digiko/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    
    // 🔒 SECURITY: Only allow image content types
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL must return an image' }, { status: 400 });
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
  }
}
