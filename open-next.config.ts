import type { Config } from "@opennextjs/cloudflare";

const config: Config = {
  default: {
    newRelic: false,
    cloudflare: {
      minifyStaticAssets: true,
    },
  },
  cache: {
    bypass: [],
  },
};

export default config;
