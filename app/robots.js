export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/reset-password/', '/verify-email/'],
      },
    ],
    sitemap: 'https://soilcredit.net/sitemap.xml',
  };
}