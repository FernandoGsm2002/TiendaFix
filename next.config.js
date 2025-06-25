/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false
  },
  // Configurar puerto por defecto
  async redirects() {
    return []
  },
  async rewrites() {
    return []
  }
}

module.exports = nextConfig 