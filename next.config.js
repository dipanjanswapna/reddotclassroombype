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
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'mir-s3-cdn-cf.behance.net', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.fbcdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'cdni.iconscout.com', pathname: '/**' },
      { protocol: 'https', hostname: 'static.vecteezy.com', pathname: '/**' },
      { protocol: 'https', hostname: 'png.pngtree.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'postimg.cc', pathname: '/**' },
      { protocol: 'https', hostname: 'i.postimg.cc', pathname: '/**' },
      { protocol: 'https', hostname: 'scontent.fdac138-1.fna.fbcdn.net', pathname: '/**' }
    ],
  },
};

module.exports = nextConfig;
