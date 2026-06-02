/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    dirs: ["src"],
  },
};

module.exports = nextConfig;