/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // ===========================================
  // STRICT MODE: Match Vercel Production Build
  // ===========================================
  typescript: {
    // Set to false to ensure TS errors FAIL the build (same as Vercel)
    // Remove this line entirely or set to true ONLY if you want to ignore errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // Set to false to ensure ESLint errors FAIL the build
    ignoreDuringBuilds: false,
  },
  
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;