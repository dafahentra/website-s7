import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import matcha from "../assets/matcha.png";
import jasmine from "../assets/jasmine.png";
import testi1 from "../assets/testi1.jpeg";
import testi2 from "../assets/testi2.png";
import testi3 from "../assets/testi3.png";

const testimonials = [
  {
    name: "Samanda Tondang",
    img: testi2,
    description:
      "Kami sangat mengapresiasi inisiatif dari Fore Coffee untuk berkolaborasi bersama dalam kampanye ini. Semoga kolaborasi kami dengan Fore Coffee bisa menginspirasi banyak pihak terutama dalam melakukan kampanye kebaikan.",
  },
  {
    name: "Devi Alfilovita",
    img: testi3,
    description:
      "Fore Coffee is one of the best merchants that I ever handled as a key account manager. we had a great journey to create some collaborations such as Exclusive Seasonal Menu, Percaya Projex, etc. The team was really helpful, organized, and had a fast response to coordinate everything.",
  },
  {
    name: "Albert Kurniawan",
    img: testi1,
    description:
      "Integrasi Ekosistem Digital Fore x blu memudahkan Genz & Millenials membeli kopi lewat pembayaran digital untuk menemani kegiatan sehari-hari sambil menikmati berbagai promo yang tersedia! Terbukti, transaksi selalu tinggi karena Fore selalu di hati!",
    icon: "&#10084;",
  },
  {
    name: "Albert Kurniawan",
    img: testi1,
    description:
      "Integrasi Ekosistem Digital Fore x blu memudahkan Genz & Millenials membeli kopi lewat pembayaran digital untuk menemani kegiatan sehari-hari sambil menikmati berbagai promo yang tersedia! Terbukti, transaksi selalu tinggi karena Fore selalu di hati!",
    icon: "&#10084;",
  },
];

const Testimoni = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Fungsi untuk menghitung jumlah item yang ditampilkan berdasarkan ukuran layar
  const getItemsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3; // lg
      if (window.innerWidth >= 768) return 2;  // md
      return 1; // mobile
    }
    return 3;
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  // Update itemsPerPage saat window resize
  React.useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Get current testimonials to display
  const getCurrentTestimonials = () => {
    const start = currentIndex * itemsPerPage;
    const end = start + itemsPerPage;
    return testimonials.slice(start, end);
  };

  return (
    <div className="max-w-[1200px] mx-auto my-20">
      <div className="flex justify-between h-64 items-center relative mx-4">
        <div>
          <img
            src={matcha}
            alt="matcha"
            className="absolute bottom-0 left-0 lg:h-52 h-24"
          />
        </div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="lg:text-6xl text-2xl text-[#1d3866] font-semibold lg:mb-10 mb-2">
            Testimoni
          </h1>
          <p className="lg:text-2xl text-lg text-[#f39248] border-dashed border-[#d0d784] border p-4 rounded-full">
            Kolaborasi Sukses Kami
          </p>
        </div>
        <div>
          <img
            src={jasmine}
            alt="jasmine"
            className="absolute top-0 right-0 lg:h-52 h-24"
          />
        </div>
      </div>

      {/* Testimonial Slider Container */}
      <div className="relative mt-10 mx-4">
        {/* Testimonials Grid with Animation */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 place-items-center gap-8"
            >
              {getCurrentTestimonials().map((testi, index) => (
                <div key={index} className="w-full max-w-sm">
                  <div className="h-60 rounded-3xl overflow-hidden bg-[#fbfbfb] py-4 px-6 shadow-xl">
                    <div className="flex gap-1">
                      <span className="text-green-500">&#x275D;</span>
                      <p className="text-[#18191f] text-base">
                        {testi.description}{" "}
                        {testi.icon && <span className="text-red-500">&#10084;</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center -ml-2 mt-5 overflow-hidden">
                    <img
                      src={testi.img}
                      alt={testi.name}
                      width={50}
                      className="rounded-full"
                    />
                    <span className="mt-4 text-[#444] font-semibold text-lg">
                      {testi.name}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Indicator - Only show if more than itemsPerPage */}
        {testimonials.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'bg-[#f39248] w-8'
                    : 'bg-gray-300 w-3 hover:bg-gray-400'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimoni;