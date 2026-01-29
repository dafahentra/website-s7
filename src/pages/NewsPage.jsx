// pages/NewsPage.jsx - REFACTORED WITH DESIGN SYSTEM
import React, { useState, useMemo, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { newsData } from "../data/newsData";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import Contact from "../components/Contact";
import { Heading } from "../components/ui";
import { TYPOGRAPHY, RADIUS, SHADOWS, TRANSITIONS } from "../styles/designSystem";

// Memoized NewsCard Component - REFACTORED
const NewsCard = memo(({ article }) => {
  const formattedDate = useMemo(() => 
    new Date(article.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    [article.date]
  );

  const authorFirstName = useMemo(() => 
    article.author.split(" ")[0],
    [article.author]
  );

  return (
    <motion.div variants={itemVariants}>
      <Link
        to={`/news/${article.slug}`}
        className={`group bg-white ${RADIUS.card.default} overflow-hidden ${SHADOWS.card.small} ${TRANSITIONS.fast} hover:shadow-[0_0_30px_rgba(29,56,102,0.3)] block h-full`}
      >
        {/* Image dengan loading lazy */}
        <div className="relative h-40 md:h-64 overflow-hidden">
          <img
            src={article.img}
            alt={article.tittle}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="p-3 md:p-6">
          {/* Category & Date */}
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <span className={`inline-block bg-brand-orange/10 text-brand-orange px-3 py-1 ${RADIUS.circle} ${TYPOGRAPHY.body.small} ${TYPOGRAPHY.weight.medium} ${TRANSITIONS.fast} group-hover:bg-brand-navy group-hover:text-white`}>
              {article.category}
            </span>
            <span className={`text-gray-400 ${TYPOGRAPHY.body.small}`}>
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h3 className={`${TYPOGRAPHY.body.small} md:${TYPOGRAPHY.body.default} ${TYPOGRAPHY.weight.bold} text-gray-800 mb-2 md:mb-3 line-clamp-2 group-hover:text-brand-navy ${TRANSITIONS.hover.color}`}>
            {article.tittle}
          </h3>

          {/* Excerpt */}
          <p className={`text-gray-600 ${TYPOGRAPHY.body.small} line-clamp-2 md:line-clamp-3 mb-3 md:mb-4`}>
            {article.excerpt}
          </p>

          {/* Location & Read More */}
          <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-gray-100">
            <p className={`${TYPOGRAPHY.body.small} text-gray-500`}>
              {authorFirstName}
            </p>
            <div className={`flex items-center text-brand-navy ${TYPOGRAPHY.weight.medium} ${TYPOGRAPHY.body.small} group-hover:gap-2 ${TRANSITIONS.fast}`}>
              <span className="hidden md:inline">Read More</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

NewsCard.displayName = 'NewsCard';

// Memoized PaginationButton Component - REFACTORED
const PaginationButton = memo(({ page, currentPage, onClick, isEllipsis = false }) => {
  if (isEllipsis) {
    return <span className="px-3 text-gray-400">...</span>;
  }

  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 ${RADIUS.circle} ${TYPOGRAPHY.weight.medium} ${TRANSITIONS.fast} ${
        currentPage === page
          ? "bg-brand-navy text-white"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {page}
    </button>
  );
});

PaginationButton.displayName = 'PaginationButton';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const NewsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;

  // Memoize perhitungan pagination
  const { totalPages, currentNews } = useMemo(() => {
    const total = Math.ceil(newsData.length / newsPerPage);
    const indexOfLastNews = currentPage * newsPerPage;
    const indexOfFirstNews = indexOfLastNews - newsPerPage;
    const current = newsData.slice(indexOfFirstNews, indexOfLastNews);

    return {
      totalPages: total,
      currentNews: current
    };
  }, [currentPage, newsPerPage]);

  // Memoize page numbers calculation
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  // useCallback untuk fungsi-fungsi yang dipass sebagai props
  const goToPage = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  return (
    <>
      <SEO 
        title="News - SECTOR SEVEN"
        description="Get the latest updates and stories from SECTOR SEVEN. Discover brewing guides, matcha culture, and more."
        keywords="sector seven matcha,sector seven news, coffee news yogyakarta, coffee articles, brewing guides, coffee culture, specialty coffee tips, matcha news yogyakarta, matcha articles"
        url="/news"
        image="/og-image.jpg"
      />

      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen bg-gray-50"
      >
        {/* Hero Section with Design System Gradient */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="pt-32 pb-20 relative overflow-hidden"
          style={{ background: 'linear-gradient(to right, #3962a8, #f0a97a)' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute transform rotate-45 -left-20 top-20 w-96 h-96 bg-white rounded-full"></div>
            <div className="absolute transform -rotate-45 -right-20 bottom-20 w-80 h-80 bg-white rounded-full"></div>
          </div>
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`${TYPOGRAPHY.heading.responsive} ${TYPOGRAPHY.weight.bold} text-white text-center mb-4`}
            >
              Sector News
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`${TYPOGRAPHY.subheading.lg} text-white/90 text-center max-w-2xl mx-auto`}
            >
              Get the latest updates and deeper coffee experience!
            </motion.p>
          </div>
        </motion.div>

        {/* News Grid */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
          >
            {currentNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-16"
            >
              {/* Previous Button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`w-10 h-10 ${RADIUS.circle} flex items-center justify-center ${TRANSITIONS.fast} ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-brand-navy text-white hover:bg-brand-orange"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Page Numbers */}
              {pageNumbers.map((page, index) => (
                <PaginationButton
                  key={index}
                  page={page}
                  currentPage={currentPage}
                  onClick={() => typeof page === 'number' && goToPage(page)}
                  isEllipsis={page === "..."}
                />
              ))}

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 ${RADIUS.circle} flex items-center justify-center ${TRANSITIONS.fast} ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-brand-navy text-white hover:bg-brand-orange"
                }`}
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </div>
        <Contact />
      </motion.div>
    </>
  );
};

export default NewsPage;
