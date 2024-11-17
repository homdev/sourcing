/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignorer les fichiers .map
    config.module.rules.push({
      test: /\.map$/,
      use: "ignore-loader"
    });

    // Gérer les dépendances de chrome-aws-lambda
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'puppeteer': 'puppeteer-core',
      };
    }

    return config;
  },
  // Désactiver temporairement les règles ESLint strictes pour le build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
