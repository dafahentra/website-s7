// components/Testimoni/TestimoniHeader.jsx
import React from "react";

const TestimoniHeader = ({ matchaImage, jasmineImage }) => {
return (
<div className="flex justify-between h-64 items-center relative mx-4">
    <div>
    <img
        src={matchaImage}
        alt="matcha"
        className="absolute bottom-0 left-0 lg:h-52 h-24"
    />
    </div>
    <div className="flex flex-col items-center justify-center">
    <h1 className="lg:text-6xl text-2xl text-[#1d3866] font-semibold lg:mb-10 mb-2">
        What They Said
    </h1>
    <p className="lg:text-2xl text-lg text-[#f39248] border-dashed border-[#d0d784] border p-4 rounded-full">
        Kolaborasi Sukses Kami
    </p>
    </div>
    <div>
    <img
        src={jasmineImage}
        alt="jasmine"
        className="absolute top-0 right-0 lg:h-52 h-24"
    />
    </div>
</div>
);
};

export default TestimoniHeader;