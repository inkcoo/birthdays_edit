import type { Config } from "@opennextjs/cloudflare";

const config: Config = {
  appRouter: true,
  imageOptimizer: false,
  middlewares: [
    "internal/middleware/_middleware.js",
  ],
};

export default config;
