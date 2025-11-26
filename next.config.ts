import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: ['next5-dev-images.s3.ap-northeast-2.amazonaws.com'],
  },
  eslint: {
    // 빌드 시 ESLint 에러가 나도 빌드는 계속 진행 npm run lint에서 lint 에러
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
