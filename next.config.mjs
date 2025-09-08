/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.imgur.com'],
  },
  // Para permitir origens de desenvolvimento
  allowedDevOrigins: ['http://192.168.0.19:3000'],
  

};


export default nextConfig;
