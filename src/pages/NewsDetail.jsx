import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getNewsBySlug, getLatestNews } from "../data/newsData";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import SEO from "../components/SEO";

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
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Artikel Tidak Ditemukan
        </h1>
        <p className="text-gray-600 mb-8">
            Maaf, artikel yang Anda cari tidak tersedia.
        </p>
        <Link
            to="/"
            className="bg-[#1d3866] text-white px-6 py-3 rounded-full hover:bg-[#2d4876] transition-colors"
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
        className="absolute top-8 left-8 bg-white/90 hover:bg-white text-[#1d3866] px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg"
        >
        <ArrowLeft size={20} />
        <span className="font-medium">Kembali</span>
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-[#f39248] text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            {article.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {article.tittle}
            </h1>
        </div>
        </div>
    </div>

    {/* Content */}
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Meta information */}
        <div className="flex flex-wrap gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
        <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#f39248]" />
            <span>
            {new Date(article.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })}
            </span>
        </div>
        <div className="flex items-center gap-2">
            <User size={18} className="text-[#f39248]" />
            <span>{article.author}</span>
        </div>
        <div className="flex items-center gap-2">
            <Tag size={18} className="text-[#f39248]" />
            <span>{article.category}</span>
        </div>
        </div>

        {/* Article content */}
        <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-700 leading-relaxed font-medium mb-6 italic">
            {article.excerpt}
        </p>
        
        {/* Render konten dinamis jika ada array content */}
        {article.content ? (
            <div className="space-y-6">
            {article.content.map((item, index) => {
                if (item.type === "text") {
                return (
                    <p key={index} className="text-gray-700 leading-relaxed text-lg">
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
                        className="w-full rounded-lg shadow-lg"
                    />
                    {item.caption && (
                        <figcaption className="text-center text-gray-500 text-sm mt-3 italic">
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
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {article.description}
            </div>
        )}
        </div>
    </div>

    {/* Related articles */}
    {relatedNews.length > 0 && (
        <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-[#1d3866] mb-8">
            Artikel Terkait
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
            {relatedNews.map((news) => (
                <Link
                key={news.id}
                to={`/news/${news.slug}`}
                className="group"
                >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow h-full">
                    <div className="relative h-48 overflow-hidden">
                    <img
                        src={news.img}
                        alt={news.tittle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    </div>
                    <div className="p-6">
                    <span className="inline-block bg-[#f39248]/10 text-[#f39248] px-3 py-1 rounded-full text-xs font-medium mb-3">
                        {news.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2 line-clamp-2">
                        {news.tittle}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                        {news.excerpt}
                    </p>
                    <p className="text-gray-400 text-sm mt-4 italic">
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