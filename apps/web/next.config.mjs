/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  transpilePackages: ["@veloz-stack/types", "@veloz-stack/template-generator"],
};

export default nextConfig;
