/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'hollandhomesllc.com' }
    ]
  }
};

module.exports = nextConfig;
