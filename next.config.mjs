/** @type {import('next').NextConfig} */
const HOST = ["localhost:8000", "api.steamidler.com"];

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: `${process.env.NODE_ENV === "production" ? HOST[1] : HOST[0]}/:path*`,
      },
    ];
  },
};

export default nextConfig;
