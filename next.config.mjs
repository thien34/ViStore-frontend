/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.pinimg.com',
            },
            {
                protocol: 'http',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
};

export default nextConfig;
