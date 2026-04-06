// apps/web/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    '@william-albarello/contracts',
    '@william-albarello/ui',
  ],
};

export default nextConfig;
