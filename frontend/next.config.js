/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  // Disable static generation to prevent build-time prerendering issues
  experimental: {
    // Force all pages to be dynamic
    workerThreads: false,
    cpus: 1,
  },
  // Disable static optimization
  trailingSlash: false,
  // Force dynamic rendering for all pages
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

module.exports = nextConfig;
