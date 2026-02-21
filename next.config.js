const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type errors in pre-existing routes (Stripe, exports, RPC, etc.) are tracked
  // separately via `tsc --noEmit`. Skip the redundant build-time check so
  // webpack errors (the real blocking issues) surface clearly.
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  staticPageGenerationTimeout: 120,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: '**.ipfs.dweb.link' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        'pino-pretty': false,
      }
    }

    // thirdweb bundles @walletconnect/utils with its own viem@2.31.0 which is
    // missing _esm files (utils/filters/, utils/ens/errors.js, etc.) added in
    // viem 2.32+. Alias that broken nested copy to the project's viem@2.39.0.
    //
    // @base-org/account ships separate browser/node entry points. When webpack
    // resolves thirdweb's dynamic `await import('@base-org/account')` it picks
    // the "node" conditional export (index.node.js) which pulls in KMS/crypto
    // modules that can't be bundled for the browser. Force the browser build.
    config.resolve.alias = {
      ...config.resolve.alias,
      [path.resolve(
        __dirname,
        'node_modules/thirdweb/node_modules/@walletconnect/utils/node_modules/viem'
      )]: path.resolve(__dirname, 'node_modules/viem'),
      '@base-org/account': path.resolve(
        __dirname,
        'node_modules/@base-org/account/dist/index.js'
      ),
    }

    return config
  },
}

module.exports = nextConfig
