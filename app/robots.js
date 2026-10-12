export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard/', '/reset-password/', '/verify-email/'],
      },
    ],
    sitemap: 'https://soilcredit.net/sitemap.xml',
  };
}