/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignorer les fichiers .map
    config.module.rules.push({
      test: /\.map$/,
      use: "ignore-loader"
    });

    return config;
  }
};

export default nextConfig;
