import React from "react";
import coffee from "../assets/coffee.png";
import foreMaster from "../assets/fore-master.png";
import foreStore from "../assets/fore-store.png";
import { Carousel } from "@material-tailwind/react";

const Hero = () => {
  return (
    <div className="max-w-[1200px] my-20 lg:my-40 mx-auto relative z-0">
      <div className="flex gap-8 mx-4">
        <Carousel 
          className="rounded-xl"
          loop={true}
          autoplay={true}
          autoplayDelay={5000}
        >
          <div className="flex items-center lg:flex-row flex-col lg:min-h-[500px] min-h-[400px]">
            <div className="lg:text-left text-center lg:w-1/2 px-4 py-8">
              <h1 className="lg:text-6xl text-3xl text-[#1d3866] mb-4 font-bold">
                Grind The Essentials
              </h1>
              <p className="lg:text-xl text-base text-[#f39248]">
                Dibuat dari biji kopi Indonesia pilihan untuk pengalaman minum
                kopi terbaik setiap hari
              </p>
            </div>
            <div className="lg:w-1/2 w-full">
              <img
                src={coffee}
                alt="coffee"
                className="object-contain w-full lg:h-[500px] h-[300px]"
              />
            </div>
          </div>

          <div className="flex items-center lg:flex-row flex-col lg:min-h-[500px] min-h-[400px]">
            <div className="lg:text-left text-center lg:w-1/2 px-4 py-8">
              <h1 className="lg:text-6xl text-3xl text-[#1d3866] mb-4 font-bold">
                Fore Grind Master 2023
              </h1>
              <p className="lg:text-xl text-base text-[#f39248]">
                Kompetisi tahunan bergengsi untuk barista Fore Coffee di seluruh
                Indonesia
              </p>
            </div>
            <div className="lg:w-1/2 w-full">
              <img
                src={foreMaster}
                alt="fore master"
                className="object-contain w-full lg:h-[500px] h-[300px]"
              />
            </div>
          </div>

          <div className="flex items-center lg:flex-row flex-col lg:min-h-[500px] min-h-[400px]">
            <div className="lg:text-left text-center lg:w-1/2 px-4 py-8">
              <h1 className="lg:text-5xl text-2xl text-[#1d3866] mb-4 font-bold">
                The 1st Fore Coffee Store That Embrace Sustainability
              </h1>
              <p className="lg:text-xl text-base text-[#f39248]">
                Dibuat dari 450kg plastik daur ulang, berlokasi di Kuningan
                City, Jakarta
              </p>
            </div>
            <div className="lg:w-1/2 w-full">
              <img
                src={foreStore}
                alt="fore store"
                className="object-contain w-full lg:h-[500px] h-[300px]"
              />
            </div>
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default Hero;