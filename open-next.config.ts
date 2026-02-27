// open-next.config.ts（正确文件名）
import type { OpenNextConfig } from '@opennextjs/open-next';

const config: OpenNextConfig = {
  // 适配 Cloudflare Pages 的基础配置
  runtime: 'edge', // 匹配你的 Next.js 项目运行时（edge/nodejs）
  // 可选：自定义函数入口、输出目录等，保持默认即可
};

export default config;