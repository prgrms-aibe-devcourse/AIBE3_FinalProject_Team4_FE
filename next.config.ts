/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // s3 bucket
      {
        protocol: 'https',
        hostname: 'shorlog-dev-images.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'next5-dev-images.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hm-dev-images.s3.ap-northeast-2.amazonaws.com',
        pathname: '/**',
      },
      //google
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      }, 
      //kakao
      {
        protocol: 'http',
        hostname: 'img1.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 't1.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaocdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't1.kakaocdn.net',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // 빌드 시 ESLint 에러가 나도 빌드는 계속 진행
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
