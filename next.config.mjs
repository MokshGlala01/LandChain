/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude Prisma and other Node.js-only packages from Edge runtime bundles
  // This prevents MIDDLEWARE_INVOCATION_FAILED when middleware tries to load Prisma
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  }
}

export default nextConfig
