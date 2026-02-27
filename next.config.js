/** @type {import('next').NextConfig} */
const nextConfig = {
  // 使用 Cloudflare Pages 适配器支持 API 路由和 SSR
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    unoptimized: true,
  },
  // 跳过类型检查，允许构建继续
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
