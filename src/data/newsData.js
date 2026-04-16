import fore1 from "../assets/fore1.jpg";
import fore2 from "../assets/fore2.jpg";

export const newsData = [
  {
    id: 1,
    slug: "hari-kartini-fore-coffee-2024",
    tittle: "SPESIAL HARI KARTINI! FORE COFFEE AJAK KONSUMEN PEREMPUAN MENGENAL INDUSTRI KOPI",
    img: fore1,
    excerpt:
      "Fore Coffee memperingati Hari Kartini pada Sabtu, 20 April 2024 di HO Fore Coffee, Jakarta.",
    content: [
      {
        type: "text",
        value:
          "Fore Coffee memperingati Hari Kartini pada Sabtu, 20 April 2024 di HO Fore Coffee, Jakarta. Perayaan yang diperingati setiap tanggal 21 April setiap tahunnya ini adalah bentuk untuk menghargai perjuangan R.A Kartini, seorang tokoh inspiratif bagi kaum perempuan di Indonesia.",
      },
      {
        type: "text",
        value:
          "Momen ini juga jadi cara mengapresiasi perjuangan Kartini dalam meraih kesetaraan di berbagai bidang. Berkembangnya zaman dan teknologi membuat perempuan harus dapat beradaptasi dengan baik mulai dari pendidikan, karir, hingga menjalani kehidupan sehari-hari.",
      },
      {
        type: "image",
        src: fore1,
        alt: "Women in Coffee Event",
        caption: "Acara Women in Coffee menyambut Hari Kartini 2024",
      },
      {
        type: "text",
        value:
          "Merayakan Hari Kartini tidak hanya sekadar menggunakan kebaya saja, tetapi juga bisa dalam berbagai cara, termasuk memahami industri kopi. Salah satunya melalui acara Women in Coffee dalam menyambut Hari Kartini tahun ini.",
      },
      {
        type: "text",
        value:
          "Women in Coffee diisi oleh dua perempuan hebat yaitu Sabrina Mayang dan Marchieta Almathea, Top 6 Finalist Fore Grind Master 2023. Mereka menjadi salah dua dari perwakilan para perempuan hebat yang jadi bagian dari Fore Coffee.",
      },
    ],
    description:
      "Fore Coffee memperingati Hari Kartini pada Sabtu, 20 April 2024 di HO Fore Coffee, Jakarta. Perayaan yang diperingati setiap tanggal 21 April setiap tahunnya ini adalah bentuk untuk menghargai perjuangan R.A Kartini, seorang tokoh inspiratif bagi kaum perempuan di Indonesia.",
    date: "2024-06-12",
    category: "News",
    author: "Fore Coffee Team",
  },
  {
    id: 2,
    slug: "new-coffee-culture-forevolution",
    tittle:
      "FORE COFFEE BAWA GEBRAKAN NEW COFFEE CULTURE MELALUI INOVASI, OTENTISITAS, DAN KAMPANYE #FOREVOLUTION",
    img: fore2,
    excerpt:
      "Sejak didirikan pada tahun 2018, Fore Coffee telah menetapkan langkah untuk terus memberikan pelayanan dan penyajian terbaik.",
    description:
      "Jakarta, 22 Mei 2024 — Sejak didirikan pada tahun 2018, Fore Coffee telah menetapkan langkah untuk terus memberikan pelayanan dan penyajian terbaik kepada pelanggan setianya melalui berbagai inovasi.",
    date: "2024-06-11",
    category: "News",
    author: "Fore Coffee Team",
  },
];

export const getNewsBySlug = (slug) => newsData.find((news) => news.slug === slug);

export const getNewsById = (id) => newsData.find((news) => news.id === id);

export const getLatestNews = (limit = 3) =>
  newsData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);

export const getNewsByCategory = (category) =>
  newsData.filter((news) => news.category === category);