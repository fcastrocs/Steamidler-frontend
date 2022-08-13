/** @type {import('next').NextConfig} */
const HOST = ["http://localhost:8000", "https://api.steamidler.com"];

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NODE_ENV === "production" ? HOST[0] : HOST[1]}/:path*`,
      },
    ];
  },
};

export default nextConfig;
