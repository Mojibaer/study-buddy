import withSerwistInit from '@serwist/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withSerwist = withSerwistInit({
    swSrc: 'src/sw.js',
    swDest: 'public/sw.js',
    disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {},
};

export default withSerwist(withNextIntl(nextConfig));
