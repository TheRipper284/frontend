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
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost",
          port: "5000",
          pathname: "/**",
        },
      ],
      unoptimized: true,
    },
  }
  
  export default nextConfig
  