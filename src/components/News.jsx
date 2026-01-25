import React from "react";
import { Link } from "react-router-dom";
import { newsData } from "../data/newsData";
import { ArrowRight } from "lucide-react";

const News = () => {
  // Ambil 4 berita terbaru saja
  const latestNews = newsData
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  return (
    <div className="max-w-[1200px] mx-auto my-40">
      <div className="flex flex-col justify-between md:flex-row md:items-center relative mx-4 md:text-left text-center">
        <h1 className="text-6xl text-[#1d3866] mb-4 font-bold">ForeNews</h1>
        <p className="text-2xl text-[#f39248] text-wrap tracking-tight">
          Dapatkan berita terbaru dan informasi <br /> menarik dari kami!
        </p>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 place-items-center my-20 gap-4 mx-4">
        {latestNews.map((data) => (
          <Link
            to={`/news/${data.slug}`}
            key={data.id}
            className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white transition-all duration-500 hover:shadow-[0_0_30px_rgba(243,146,72,0.3)] h-full group"
          >
            <div className="relative overflow-hidden h-52">
              <img
                className="object-cover h-full w-full"
                src={data.img}
                alt={data.tittle}
              />
              <div className="absolute top-4 right-4">
                <span className="bg-[#f39248] text-white px-3 py-1 rounded-full text-xs font-medium">
                  {data.category}
                </span>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="text-xl font-semibold mb-2 capitalize text-gray-700 line-clamp-2">
                {data.tittle.toLowerCase()}
              </div>
              <p className="text-gray-500 mt-4 text-sm line-clamp-3">
                {data.excerpt}
              </p>
              <div className="flex items-center text-[#f39248] mt-4 font-medium group-hover:gap-2 transition-all">
                <span className="text-sm">Baca Selengkapnya</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <hr />
            <div className="px-6 pt-2 pb-4">
              <p className="text-gray-500 italic tracking-wide text-sm">
                {new Date(data.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        <Link
          to="/news"
          className="mt-4 bg-[#1d3866] px-8 py-4 rounded-full w-[200px] text-white hover:border-[#1d3866] hover:bg-white hover:text-[#1d3866] transition-colors duration-300 text-md shadow-2xl shadow-[#1d3866] border-2 border-[#1d3866] text-center"
        >
          Selengkapnya
        </Link>
      </div>
    </div>
  );
};

export default News;