/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      domains: ["localhost"],
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost",
          port: "5000",
          pathname: "/uploads/**",
        },
      ],
      unoptimized: true,
    },
  }
  
  module.exports = nextConfig
  