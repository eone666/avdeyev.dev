const ENV = require("./env.js");
const configureBundleAnalyzer = require("@next/bundle-analyzer");

const withBundleAnalyzer = configureBundleAnalyzer({
  enabled: ENV.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({});

module.exports = nextConfig;
