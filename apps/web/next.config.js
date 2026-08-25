/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/core", "@repo/database"],
};

export default nextConfig;
