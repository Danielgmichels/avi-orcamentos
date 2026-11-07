/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Para que o @react-pdf/renderer funcione perfeitamente com canvas/server components
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
