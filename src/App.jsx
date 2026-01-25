import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Menu from "./pages/Menu";
import Store from "./pages/Store";
import ContactUs from "./pages/ContactUs";
import NewsPage from "./pages/NewsPage";
import NewsDetail from "./pages/NewsDetail";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Router basename="/website-s7">
      <ScrollToTop />
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/store" element={<Store />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;