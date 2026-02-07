/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    'https://*.cloudworkstations.dev',
    'https://6000-firebase-studio-1751017024253.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev'
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Suppress OpenTelemetry and Sentry warnings by treating them as external packages
  serverExternalPackages: [
    '@opentelemetry/sdk-node',
    '@opentelemetry/instrumentation',
    '@opentelemetry/instrumentation-redis-4',
    '@opentelemetry/instrumentation-undici',
    '@sentry/nextjs',
    '@sentry/node'
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'mir-s3-cdn-cf.behance.net' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: 'cdni.iconscout.com' },
      { protocol: 'https', hostname: 'static.vecteezy.com' },
      { protocol: 'https', hostname: 'png.pngtree.com' },
      { protocol: 'https', hostname: 'picsum.photos' }
    ],
  },
};

module.exports = nextConfig;