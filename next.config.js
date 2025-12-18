/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.nhost.run',
        port: '',
        pathname: '/v1/files/**',
      },
    ],
  },
}

module.exports = nextConfig
