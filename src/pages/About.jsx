import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import News from "../components/News";
import Contact from "../components/Contact";

const About = () => {
const [activeYear, setActiveYear] = useState(null);
const [currentTestimonial, setCurrentTestimonial] = useState(0);
const [showAllMilestones, setShowAllMilestones] = useState(false);

// Data BOD - 5 people
const bodMembers = [
{
    name: "Claresta Zuhrah A",
    position: "Chief Executive Officer",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    bio: "Indonesian Citizen, born in 1978. Experienced leader with 20+ years in coffee industry.",
},
{
    name: "Dafa Hentra A",
    position: "Finance & Legal Director",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bio: "Indonesian Citizen, born in 1982. Expert in business development and strategic planning.",
},
{
    name: "Siti Intan N",
    position: "Marketing & Brand Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Indonesian Citizen, born in 1985. Specialist in corporate finance and investment.",
},
{
    name: "Salsabilla Syafa K",
    position: "Operational Director",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    bio: "Indonesian Citizen, born in 1980. Expert in retail operations and market expansion.",
},
{
    name: "Devon Del Rey",
    position: "Business Development",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    bio: "Indonesian Citizen, born in 1975. Expertise in sustainable business practices and ESG.",
},
];

// Data Milestone - 3 milestones
const milestones = [
{
    year: "2018",
    title: "Launch First Store",
    description: "Sector Seven membuka toko pertama di Yogyakarta dengan fokus pada matcha berkualitas tinggi.",
    details: [
    "Toko pertama dibuka di kawasan Kaliurang, Yogyakarta",
    "Memperkenalkan konsep matcha premium dengan sentuhan lokal",
    "Berhasil melayani 500+ pelanggan di bulan pertama"
    ],
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop"
},
{
    year: "2020",
    title: "Menu Innovation",
    description: "Peluncuran menu baru dengan berbagai varian kopi specialty dan signature drinks.",
    details: [
    "Menghadirkan 15+ menu baru berbasis kopi specialty",
    "Kolaborasi dengan roaster lokal terbaik",
    "Pelatihan barista profesional untuk semua staff"
    ],
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop"
},
{
    year: "2023",
    title: "National Expansion",
    description: "Ekspansi ke berbagai kota di Indonesia dengan fokus pada kualitas dan keberlanjutan.",
    details: [
    "Membuka cabang di 15 kota besar Indonesia",
    "Mendapat sertifikasi Halal untuk semua produk",
    "Partnership dengan petani kopi dan matcha lokal"
    ],
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&h=400&fit=crop"
}
];

// Customer Testimonials
const customerTestimonials = [
{
    name: "Rani Kusuma",
    role: "Regular Customer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    quote: "Sector Seven adalah tempat favorit saya untuk menikmati matcha latte. Kualitasnya selalu konsisten dan suasananya sangat nyaman untuk bekerja atau sekadar bersantai. Pelayanannya juga sangat ramah!"
},
{
    name: "Dimas Prasetyo",
    role: "Coffee Enthusiast",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    quote: "Sebagai penikmat kopi, saya sangat terkesan dengan kualitas biji kopi yang digunakan Sector Seven. Setiap cangkir kopi yang disajikan memiliki karakter rasa yang kuat dan memorable. Highly recommended!"
},
{
    name: "Siti Nurhaliza",
    role: "Food Blogger",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    quote: "Saya sudah mencoba berbagai coffee shop di kota ini, tapi Sector Seven memiliki keunikan tersendiri. Menu-menunya inovatif dan instagrammable, perfect untuk konten saya. The ambiance is also on point!"
},
{
    name: "Budi Santoso",
    role: "Entrepreneur",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    quote: "Sector Seven adalah go-to place untuk meeting dengan klien. Tempatnya profesional, menu beragam, dan WiFi-nya kencang. Beberapa deal penting saya finalisasi di sini sambil menikmati secangkir kopi mereka."
},
{
    name: "Maya Anggraini",
    role: "Student",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    quote: "Tempat yang sempurna untuk belajar! Suasananya tenang, ada colokan di setiap meja, dan kopinya enak. Harganya juga masih terjangkau untuk mahasiswa seperti saya. Thank you Sector Seven!"
},
{
    name: "Andi Firmansyah",
    role: "Creative Director",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    quote: "Interior design-nya aesthetic banget! Cocok untuk brainstorming dengan tim kreatif saya. Plus, kopinya juga top quality. Sector Seven understands what creative people need - good coffee and inspiring space."
}
];

const nextTestimonial = () => {
setCurrentTestimonial((prev) => (prev + 1) % customerTestimonials.length);
};

const prevTestimonial = () => {
setCurrentTestimonial((prev) =>
    prev === 0 ? customerTestimonials.length - 1 : prev - 1
);
};

return (
<div className="pt-32 min-h-screen bg-gradient-to-b from-white to-gray-50">
    {/* Hero Section */}
    <div className="max-w-[1400px] mx-auto mb-20">
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-[500px] mx-4 rounded-3xl overflow-hidden"
    >
        <img
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&h=500&fit=crop"
        alt="Our Story"
        className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
        <div className="max-w-3xl ml-12 text-white">
            <p className="text-xl mb-4 tracking-wider">About Sector Seven</p>
            <h1 className="text-7xl font-bold mb-6">Our Story</h1>
            <p className="text-2xl font-light">
            Get to know about us, stores, environment, and people behind it!
            </p>
        </div>
        </div>
    </motion.div>
    </div>

    {/* 1. Story Section - Our Story */}
    <div className="max-w-[1200px] mx-auto mb-32">
    <div className="grid lg:grid-cols-2 gap-16 items-center mx-4">
        <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        >
        <p className="text-sm text-[#f39248] mb-4 tracking-wider uppercase">Our Story</p>
        <h2 className="text-6xl font-bold text-[#1d3866] mb-8 leading-tight">
            Your Sector,<br />Your Soul
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Di tengah kesibukan dunia modern, mudah untuk kehilangan fokus pada hal-hal yang benar-benar penting.
            Sector Seven hadir sebagai tempat pelarian di mana Anda dapat memperlambat tempo dan menikmati
            secangkir minuman berkualitas tinggi.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
            Filosofi kami tercermin dalam setiap cangkir yang kami sajikan - menginspirasi orang untuk
            merangkul hal-hal esensial dalam hidup di tengah gaya hidup yang sibuk, satu cangkir pada satu waktu.
        </p>
        </motion.div>

        <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative"
        >
        <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop"
            alt="Story"
            className="rounded-3xl shadow-2xl"
        />
        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#f39248] rounded-full -z-10"></div>
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#1d3866] rounded-full -z-10"></div>
        </motion.div>
    </div>
    </div>

    {/* 2. Our Values Section */}
    <div className="py-20 bg-white">
    <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-6xl font-bold text-[#1d3866] mb-6 text-center">Our Values</h2>
        <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto text-lg">
        Nilai-nilai ini adalah bahasa umum kami yang benar-benar menangkap semangat bagaimana kami selalu melakukan hal-hal di bisnis kami.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Value 1 */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
        >
            <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-[#6b8e4e] flex items-center justify-center">
            <svg className="w-20 h-20 text-[#6b8e4e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#6b8e4e] mb-4">We do the right thing...</h3>
            <p className="text-gray-700 leading-relaxed">
            Kami <span className="font-bold">terbuka, jujur</span> dan <span className="font-bold">menghormati</span>. Kami <span className="font-bold">melakukan apa yang kami katakan dan mengatakan apa yang kami lakukan</span>.
            </p>
        </motion.div>

        {/* Value 2 */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
        >
            <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-[#f39248] flex items-center justify-center">
            <svg className="w-20 h-20 text-[#f39248]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#f39248] mb-4">We are in it together...</h3>
            <p className="text-gray-700 leading-relaxed">
            Kami semua bagian dari <span className="font-bold">keluarga Sector Seven</span>. Kami <span className="font-bold">saling mendukung</span> dan <span className="font-bold">menyertakan</span> semua orang.
            </p>
        </motion.div>

        {/* Value 3 */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
        >
            <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-[#9b4d96] flex items-center justify-center">
            <svg className="w-20 h-20 text-[#9b4d96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#9b4d96] mb-4">We give a damn...</h3>
            <p className="text-gray-700 leading-relaxed">
            Kami <span className="font-bold">peduli</span> tentang apa yang kami lakukan dan <span className="font-bold">bangga</span> dengan cara kami melakukannya. Kami <span className="font-bold">bersemangat</span> dan <span className="font-bold">membuat perbedaan</span>.
            </p>
        </motion.div>

        {/* Value 4 */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center"
        >
            <div className="w-40 h-40 mx-auto mb-6 rounded-full border-4 border-[#5dade2] flex items-center justify-center">
            <svg className="w-20 h-20 text-[#5dade2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#5dade2] mb-4">We get it done...</h3>
            <p className="text-gray-700 leading-relaxed">
            Kami menggunakan <span className="font-bold">talenta unik</span> kami untuk menemukan <span className="font-bold">solusi</span> dan <span className="font-bold">mencapai tujuan bersama</span>. Kami merayakan kesuksesan.
            </p>
        </motion.div>
        </div>
    </div>
    </div>

    {/* 3. Our Customer Says - Testimonial Slider */}
    <div className="py-20 bg-gradient-to-b from-white to-gray-50">
    <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16 mx-4">
        <h2 className="text-6xl font-bold text-[#1d3866] mb-4">Our Customer Says</h2>
        </div>

        <div className="mx-4 relative">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
            <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid lg:grid-cols-2 gap-8 items-center p-12"
            >
                {/* Customer Image */}
                <div className="relative">
                <div className="relative w-full max-w-md mx-auto">
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#f39248] rounded-full opacity-50"></div>
                    <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#1d3866] rounded-full opacity-50"></div>
                    <img
                    src={customerTestimonials[currentTestimonial].image}
                    alt={customerTestimonials[currentTestimonial].name}
                    className="relative rounded-3xl shadow-2xl w-full aspect-square object-cover"
                    />
                </div>
                <div className="text-center mt-8">
                    <h3 className="text-3xl font-bold text-[#1d3866] mb-2">
                    {customerTestimonials[currentTestimonial].name}
                    </h3>
                    <p className="text-xl text-[#f39248] font-semibold">
                    {customerTestimonials[currentTestimonial].role}
                    </p>
                </div>
                </div>

                {/* Testimonial Quote */}
                <div className="relative">
                <div className="text-8xl text-[#f39248] opacity-20 absolute -top-8 -left-4">"</div>
                <p className="text-2xl text-gray-700 leading-relaxed relative z-10 pl-12 pr-8">
                    {customerTestimonials[currentTestimonial].quote}
                </p>
                <div className="text-8xl text-[#f39248] opacity-20 absolute -bottom-8 -right-4">"</div>
                </div>
            </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-center items-center gap-4 pb-8">
            <button
                onClick={prevTestimonial}
                className="bg-[#1d3866] hover:bg-[#f39248] text-white p-3 rounded-full transition-colors duration-300 shadow-lg"
                aria-label="Previous testimonial"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Dots indicator */}
            <div className="flex gap-2">
                {customerTestimonials.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === index
                        ? 'bg-[#f39248] w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                />
                ))}
            </div>

            <button
                onClick={nextTestimonial}
                className="bg-[#1d3866] hover:bg-[#f39248] text-white p-3 rounded-full transition-colors duration-300 shadow-lg"
                aria-label="Next testimonial"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            </div>
        </div>

        {/* Counter */}
        <div className="text-center mt-6">
            <p className="text-gray-500 font-semibold">
            {currentTestimonial + 1} / {customerTestimonials.length}
            </p>
        </div>
        </div>
    </div>
    </div>

    {/* BOD Section */}
    <div className="py-20 bg-white">
    <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-6xl font-bold text-[#2c5530] mb-16 text-center">Board of Directors</h2>

        {/* First row - 3 members */}
        <div className="grid md:grid-cols-3 gap-8 mb-8 max-w-[900px] mx-auto">
        {bodMembers.slice(0, 3).map((member, index) => (
            <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
            >
            {/* Circular Image with gradient background */}
            <div className="relative w-[240px] h-[240px] mx-auto mb-[-40px] z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
                <img
                src={member.image}
                alt={member.name}
                className="relative w-full h-full object-cover rounded-full"
                />
            </div>

            {/* Name and Position Card */}
            <div className="bg-white rounded-2xl p-6 pt-14 shadow-md relative">
                <h3 className="text-xl font-bold text-[#2c5530] mb-2">
                {member.name}
                </h3>
                <p className="text-gray-600 font-medium">
                {member.position}
                </p>
            </div>
            </motion.div>
        ))}
        </div>

        {/* Second row - 2 members (centered) */}
        <div className="grid md:grid-cols-2 gap-8 max-w-[600px] mx-auto">
        {bodMembers.slice(3, 5).map((member, index) => (
            <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index + 3) * 0.1 }}
            className="text-center"
            >
            {/* Circular Image with gradient background */}
            <div className="relative w-[240px] h-[240px] mx-auto mb-[-40px] z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
                <img
                src={member.image}
                alt={member.name}
                className="relative w-full h-full object-cover rounded-full"
                />
            </div>

            {/* Name and Position Card */}
            <div className="bg-white rounded-2xl p-6 pt-14 shadow-md relative">
                <h3 className="text-xl font-bold text-[#2c5530] mb-2">
                {member.name}
                </h3>
                <p className="text-gray-600 font-medium">
                {member.position}
                </p>
            </div>
            </motion.div>
        ))}
        </div>
    </div>
    </div>

    {/* News Section */}
    <News />

    {/* Milestone Section - Mobile Responsive */}
    <div className="bg-[#f8f9f5] py-20 mb-20">
    <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-5xl font-bold text-[#1d3866] mb-20 text-center">Milestone</h2>

        {/* Desktop Layout */}
        <div className="hidden lg:block relative pl-[200px]">
        {/* Vertical Timeline Line */}
        <div className="absolute left-[130px] top-0 bottom-20 w-0.5 bg-gray-300"></div>

        {/* Display milestones */}
        {milestones.slice(0, showAllMilestones ? milestones.length : 2).map((milestone, index) => (
            <motion.div
            key={milestone.year}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="mb-20 last:mb-8 relative"
            >
            {/* Green vertical bar on the timeline */}
            <div className="absolute left-[-70px] top-1/2 -translate-y-1/2 w-2 h-32 bg-[#6b8e4e] rounded-full z-10"></div>

            {/* Year Badge */}
            <div className="absolute left-[-200px] top-1/2 -translate-y-1/2 text-right pr-4">
                <div className="text-4xl font-bold text-[#2c5530]">
                {milestone.year}
                </div>
            </div>

            {/* Content with image and text */}
            <div className="grid grid-cols-[360px,1fr] gap-10 items-start">
                <div className="rounded-2xl overflow-hidden">
                <img
                    src={milestone.image}
                    alt={milestone.title}
                    className="w-full h-[240px] object-cover"
                />
                </div>

                <div className="pt-2">
                <h3 className="text-2xl font-bold text-[#2c5530] mb-6">
                    {milestone.title}
                </h3>
                <div className="space-y-4">
                    {milestone.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed text-lg">
                        <span className="font-bold">{idx + 1}.</span> {detail}
                    </p>
                    ))}
                </div>
                </div>
            </div>
            </motion.div>
        ))}
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-12 relative">
        {/* Vertical Line connecting milestones - Thicker and darker */}
        <div className="absolute left-1/2 -translate-x-1/2 top-12 bottom-12 w-1 bg-[#6b8e4e] opacity-30 z-0"></div>
        
        {milestones.slice(0, showAllMilestones ? milestones.length : 2).map((milestone, index) => (
            <motion.div
            key={milestone.year}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative z-10"
            >
            {/* Year Badge - Mobile */}
            <div className="text-center mb-4 relative z-20">
                <div className="inline-block bg-[#6b8e4e] text-white px-6 py-2 rounded-full text-2xl font-bold shadow-lg">
                {milestone.year}
                </div>
            </div>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden mb-6">
                <img
                src={milestone.image}
                alt={milestone.title}
                className="w-full h-[200px] object-cover"
                />
            </div>

            {/* Content */}
            <div>
                <h3 className="text-2xl font-bold text-[#2c5530] mb-4 text-center bg-[#f8f9f5] relative z-20 inline-block px-6 left-1/2 -translate-x-1/2">
                {milestone.title}
                </h3>
                <div className="space-y-3 bg-white p-6 rounded-2xl shadow-md">
                {milestone.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed">
                    <span className="font-bold text-[#6b8e4e]">{idx + 1}.</span> {detail}
                    </p>
                ))}
                </div>
            </div>
            </motion.div>
        ))}
        </div>

        {/* See More/Less Buttons */}
        <div className="flex justify-center mt-12">
        {!showAllMilestones && milestones.length > 2 ? (
            <button
            onClick={() => setShowAllMilestones(true)}
            className="border-2 border-[#2c5530] text-[#2c5530] px-8 py-3 rounded-full font-semibold hover:bg-[#2c5530] hover:text-white transition-colors duration-300 flex items-center gap-2"
            >
            See More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            </button>
        ) : showAllMilestones && (
            <button
            onClick={() => setShowAllMilestones(false)}
            className="border-2 border-[#2c5530] text-[#2c5530] px-8 py-3 rounded-full font-semibold hover:bg-[#2c5530] hover:text-white transition-colors duration-300 flex items-center gap-2"
            >
            Show Less
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            </button>
        )}
        </div>
    </div>
    </div>
    <Contact />
</div>
);
};

export default About;