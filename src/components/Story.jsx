import React from "react";
import story from "../assets/story.png";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Mengimpor Link untuk navigasi internal

const Story = () => {
  return (
    <div className="max-w-[1200px] my-10 mx-auto">
      <div className="mx-4">
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              opacity: 1,
              x: 0,
              transition: {
                duration: 0.7,
              },
            },
            hidden: { opacity: 0, x: "-100%" },
          }}
          className="text-6xl text-[#1d3866] mb-4 font-bold md:text-left text-center"
        >
          Our Story
        </motion.h1>
        <div className="grid lg:grid-cols-2 gap-8 place-items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  duration: 1,
                },
              },
              hidden: { opacity: 0, x: "-100%" },
            }}
            className="h-full"
          >
            <img src={story} alt="story" className="object-cover" />
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  duration: 1,
                },
              },
              hidden: { opacity: 0, x: "-100%" },
            }}
          >
            <p className="text-2xl text-black text-justify mb-4 align-top mt-8">
              Didirikan pada tahun 2026, SECTOR SEVEN bermula dari usaha rintisan yang
              bercita-cita menggabungkan matcha arawa ciwidey. <br /> <br /> 
              Kami hadir untuk memberikan pengalaman rasa yang unik bagi para pecinta kopi dan matcha di lingkungan fakultas.
            </p>
            
            {/* Mengarahkan tombol ke rute /about yang sudah didefinisikan di App.jsx */}
            <Link to="/about">
              <button className="mt-4 bg-[#1d3866] px-8 py-4 rounded-full w-[200px] text-white hover:border-[#1d3866] hover:bg-white hover:text-[#1d3866] transition-all duration-300 text-md shadow-2xl shadow-[#1d3866] border-2 border-[#1d3866]">
                Selengkapnya
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Story;