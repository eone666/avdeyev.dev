// eslint-disable-next-line @typescript-eslint/no-var-requires
const ENV = require("./env.js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const configureBundleAnalyzer = require("@next/bundle-analyzer");

const withBundleAnalyzer = configureBundleAnalyzer({
  enabled: ENV.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({});

module.exports = nextConfig;
