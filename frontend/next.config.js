/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      // Either use 'domains'...
      // domains: ['images.unsplash.com', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  
      // ...or the more flexible remotePatterns:
      remotePatterns: [
        { protocol: 'https', hostname: 'images.unsplash.com' },
        { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
        { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        // add any other hosts you use
      ],
    },
  };
  
  module.exports = nextConfig;
  