// components/SEO.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
title, 
description, 
keywords,
image,
url,
type = 'website',
author = 'Sector Seven Coffee'
}) => {
const siteUrl = 'https://sectorseven.netlify.app'; // GANTI DENGAN DOMAIN ASLI ANDA
const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
const imageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/og-image.jpg`;

return (
<Helmet>
    {/* Basic Meta Tags */}
    <title>{title}</title>
    <meta name="description" content={description} />
    {keywords && <meta name="keywords" content={keywords} />}
    <meta name="author" content={author} />
    <link rel="canonical" href={fullUrl} />

    {/* Open Graph / Facebook */}
    <meta property="og:type" content={type} />
    <meta property="og:url" content={fullUrl} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={imageUrl} />

    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content={fullUrl} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={imageUrl} />

    {/* Article specific */}
    {type === 'article' && (
    <>
        <meta property="article:author" content={author} />
        <meta property="article:publisher" content="Sector Seven Coffee" />
    </>
    )}
</Helmet>
);
};

export default SEO;