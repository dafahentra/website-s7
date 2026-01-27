// utils/generateSitemap.js
import { newsData } from '../data/newsData';

export const generateSitemap = () => {
const baseUrl = 'https://sectorseven.space'; // Ganti dengan domain Anda
const today = new Date().toISOString().split('T')[0];

const staticPages = [
{ url: '/', changefreq: 'daily', priority: '1.0' },
{ url: '/about', changefreq: 'monthly', priority: '0.8' },
{ url: '/menu', changefreq: 'weekly', priority: '0.9' },
{ url: '/store', changefreq: 'monthly', priority: '0.8' },
{ url: '/contact-us', changefreq: 'monthly', priority: '0.7' },
{ url: '/news', changefreq: 'daily', priority: '0.9' },
];

const newsPages = newsData.map(article => ({
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

return sitemap;
};

// Function to download sitemap
export const downloadSitemap = () => {
const sitemap = generateSitemap();
const blob = new Blob([sitemap], { type: 'text/xml' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'sitemap.xml';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
window.URL.revokeObjectURL(url);
};