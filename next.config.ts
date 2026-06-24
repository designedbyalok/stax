import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Type errors now fail the build — the codebase is type-clean, so
  // keep it that way and catch regressions at build time.
  typescript: { ignoreBuildErrors: false },
  // Keep heavy, server-only parsers out of the Webpack bundle —
  // Next loads them at runtime via require() instead of analyzing
  // + bundling them, which speeds up builds.
  serverExternalPackages: [
    "pdfjs-dist",
    "pdf-parse",
    "cheerio",
    "mammoth",
    "@googleapis/calendar",
    "google-auth-library",
  ],
  // Tree-shake icon + util libraries more aggressively. Next compiles them
  // as if you wrote per-icon imports, which shrinks bundles + speeds up
  // RSC module-graph analysis during build.
  experimental: {
    optimizePackageImports: [
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
      "date-fns",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@base-ui/react",
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false; // Disable eval source maps that break pdfjs-dist
    }
    return config;
  },
  // Next 16 defaults to Turbopack and errors out when a `webpack` key is
  // present with no Turbopack config. The webpack tweak above is dev-only,
  // so an empty Turbopack config is enough to let production builds proceed
  // without changing any behavior.
  turbopack: {},
};

const sentryEnabled =
  !!process.env.SENTRY_AUTH_TOKEN &&
  !!process.env.SENTRY_ORG &&
  !!process.env.SENTRY_PROJECT;

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
    })
  : nextConfig;
