/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/render": ["./src/**/*", "./public/**/*", "./remotion.config.ts"],
  },
};

export default nextConfig;
