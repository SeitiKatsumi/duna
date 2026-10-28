import type { NextConfig } from 'next';
import path from 'node:path';
const nextConfig: NextConfig = { basePath: '/hipro', output: 'standalone', outputFileTracingRoot: path.resolve(process.cwd(), '..'), experimental: { cpus: 2 }, serverExternalPackages: ['node:sqlite'] };
export default nextConfig;
