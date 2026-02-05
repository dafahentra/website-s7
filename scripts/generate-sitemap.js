import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseUrl = 'https://sectorseven.space';
const today = new Date().toISOString().split('T')[0];

// Daftar artikel news (update manual setiap kali ada artikel baru)
const newsArticles = [
    { slug: 'hari-kartini-fore-coffee-2024', date: '2024-06-12' },
    { slug: 'new-coffee-culture-forevolution', date: '2024-06-11' },
  // Tambahkan artikel baru di sini
];

const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/about', changefreq: 'monthly', priority: '0.8' },
    { url: '/menu', changefreq: 'weekly', priority: '0.9' },
    { url: '/store', changefreq: 'monthly', priority: '0.8' },
    { url: '/contact-us', changefreq: 'monthly', priority: '0.7' },
    { url: '/news', changefreq: 'daily', priority: '0.9' },
];

const newsPages = newsArticles.map(article => ({
    url: `/news/${article.slug}`,
    changefreq: 'weekly',
    priority: '0.7',
    lastmod: article.date
}));

const allPages = [...staticPages, ...newsPages];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

const publicPath = resolve(__dirname, '../public');
writeFileSync(resolve(publicPath, 'sitemap.xml'), sitemap);
console.log(`✅ Sitemap generated with ${allPages.length} pages at public/sitemap.xml`);