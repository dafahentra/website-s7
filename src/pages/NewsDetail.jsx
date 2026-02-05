// pages/NewsDetail.jsx - REFACTORED WITH DESIGN SYSTEM
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getNewsBySlug, getLatestNews } from "../data/newsData";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import SEO from "../components/SEO";
import { TYPOGRAPHY, RADIUS, SHADOWS, TRANSITIONS } from "../styles/designSystem";

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = getNewsBySlug(slug);
  const latestNews = getLatestNews(3);

  // Jika artikel tidak ditemukan
  if (!article) {
    return (
      <>
        <SEO 
          title="Article Not Found - SECTOR SEVEN"
          description="The article you are looking for is not available."
          url={`/news/${slug}`}
        />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className={`${TYPOGRAPHY.heading.tablet} ${TYPOGRAPHY.weight.bold} text-gray-800 mb-4`}>
              Artikel Tidak Ditemukan
            </h1>
            <p className={`${TYPOGRAPHY.body.default} text-gray-600 mb-8`}>
              Maaf, artikel yang Anda cari tidak tersedia.
            </p>
            <Link
              to="/"
              className={`bg-brand-navy text-white px-6 py-3 ${RADIUS.circle} ${TRANSITIONS.hover.color} hover:bg-brand-orange inline-block`}
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Filter artikel terkait (exclude artikel saat ini)
  const relatedNews = latestNews.filter((news) => news.id !== article.id);

  // Article Structured Data untuk Google Rich Results
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.tittle,
    "description": article.excerpt || article.description?.substring(0, 160),
    "image": {
      "@type": "ImageObject",
      "url": `https://sectorseven.space${article.img}`,
      "width": 1200,
      "height": 630
    },
    "datePublished": article.date,
    "dateModified": article.date,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "SECTOR SEVEN",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sectorseven.space/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://sectorseven.space/news/${article.slug}`
    }
  };

  return (
    <>
      <SEO 
        title={`${article.tittle} - SECTOR SEVEN News`}
        description={article.excerpt || article.description?.substring(0, 160)}
        keywords={`${article.category}, ${article.tittle}, sector seven coffee news, coffee news yogyakarta, matcha news yogyakarta, matcha articles, coffee articles`}
        url={`/news/${article.slug}`}
        image={article.img}
        type="article"
        author={article.author}
      />

      {/* Article Structured Data */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      <div className="bg-gray-50 pt-20">
        {/* Header dengan gambar */}
        <div className="relative h-[500px] bg-gray-900">
          <img
            src={article.img}
            alt={article.tittle}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Tombol kembali */}
          <button
            onClick={() => navigate(-1)}
            className={`absolute top-8 left-8 bg-white/90 hover:bg-white text-brand-navy px-4 py-2 ${RADIUS.circle} flex items-center gap-2 ${TRANSITIONS.fast} ${SHADOWS.card.responsive}`}
          >
            <ArrowLeft size={20} />
            <span className={TYPOGRAPHY.weight.medium}>Kembali</span>
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <span className={`inline-block bg-brand-orange text-white px-4 py-1 ${RADIUS.circle} ${TYPOGRAPHY.body.small} ${TYPOGRAPHY.weight.medium} mb-4`}>
                {article.category}
              </span>
              <h1 className={`${TYPOGRAPHY.heading.mobile} md:${TYPOGRAPHY.heading.responsive} ${TYPOGRAPHY.weight.bold} text-white mb-4 leading-tight`}>
                {article.tittle}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          {/* Meta information */}
          <div className={`flex flex-wrap gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200`}>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-brand-orange" />
              <span className={TYPOGRAPHY.body.regular}>
                {new Date(article.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-brand-orange" />
              <span className={TYPOGRAPHY.body.regular}>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-brand-orange" />
              <span className={TYPOGRAPHY.body.regular}>{article.category}</span>
            </div>
          </div>

          {/* Article content */}
          <div className="prose prose-lg max-w-none">
            <p className={`${TYPOGRAPHY.subheading.lg} text-gray-700 leading-relaxed ${TYPOGRAPHY.weight.medium} mb-6 italic`}>
              {article.excerpt}
            </p>
            
            {/* Render konten dinamis jika ada array content */}
            {article.content ? (
              <div className="space-y-6">
                {article.content.map((item, index) => {
                  if (item.type === "text") {
                    return (
                      <p key={index} className={`${TYPOGRAPHY.body.default} text-gray-700 leading-relaxed`}>
                        {item.value}
                      </p>
                    );
                  }
                  
                  if (item.type === "image") {
                    return (
                      <figure key={index} className="my-8">
                        <img
                          src={item.src}
                          alt={item.alt}
                          className={`w-full ${RADIUS.card.default} ${SHADOWS.card.responsive}`}
                        />
                        {item.caption && (
                          <figcaption className={`text-center text-gray-500 ${TYPOGRAPHY.body.small} mt-3 italic`}>
                            {item.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  
                  return null;
                })}
              </div>
            ) : (
              /* Fallback ke description jika tidak ada content array */
              <div className={`${TYPOGRAPHY.body.default} text-gray-700 leading-relaxed whitespace-pre-line`}>
                {article.description}
              </div>
            )}
          </div>
        </div>

        {/* Related articles */}
        {relatedNews.length > 0 && (
          <div className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <h2 className={`${TYPOGRAPHY.subheading.desktop} ${TYPOGRAPHY.weight.bold} text-brand-navy mb-8`}>
                Artikel Terkait
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedNews.map((news) => (
                  <Link
                    key={news.id}
                    to={`/news/${news.slug}`}
                    className="group"
                  >
                    <div className={`bg-white ${RADIUS.card.responsive} overflow-hidden ${SHADOWS.card.responsive} hover:shadow-card-xl ${TRANSITIONS.hover.color} h-full`}>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={news.img}
                          alt={news.tittle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <span className={`inline-block bg-brand-orange/10 text-brand-orange px-3 py-1 ${RADIUS.circle} ${TYPOGRAPHY.body.small} ${TYPOGRAPHY.weight.medium} mb-3`}>
                          {news.category}
                        </span>
                        <h3 className={`${TYPOGRAPHY.body.default} ${TYPOGRAPHY.weight.semibold} text-gray-700 mb-2 line-clamp-2`}>
                          {news.tittle}
                        </h3>
                        <p className={`text-gray-500 ${TYPOGRAPHY.body.small} line-clamp-2`}>
                          {news.excerpt}
                        </p>
                        <p className={`text-gray-400 ${TYPOGRAPHY.body.small} mt-4 italic`}>
                          {new Date(news.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NewsDetail;