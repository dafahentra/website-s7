import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import usePageTracking from "./hooks/usePageTracking";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Menu from "./pages/Menu";
import Store from "./pages/Store";
import ContactUs from "./pages/ContactUs";
import NewsPage from "./pages/NewsPage";
import NewsDetail from "./pages/NewsDetail";
import ScrollToTop from "./components/ScrollToTop";

// Component wrapper untuk tracking
function AppContent() {
  usePageTracking(); // Track page views

  return (
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
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router basename="/">
        <ScrollToTop />
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;