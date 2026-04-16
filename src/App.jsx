import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import usePageTracking from "./hooks/usePageTracking";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

const Home        = lazy(() => import("./pages/Home"));
const About       = lazy(() => import("./pages/About"));
const Menu        = lazy(() => import("./pages/Menu"));
const Store       = lazy(() => import("./pages/Store"));
const ContactUs   = lazy(() => import("./pages/ContactUs"));
const NewsPage    = lazy(() => import("./pages/NewsPage"));
const NewsDetail  = lazy(() => import("./pages/NewsDetail"));
const MokaCallback = lazy(() => import("./pages/MokaCallback"));
const LoyaltyPage = lazy(() => import("./pages/Loyalty"));

function AppContent() {
  usePageTracking();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-[#f4f2ef]" />}>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/about"      element={<About />} />
          <Route path="/menu"       element={<Menu />} />
          <Route path="/store"      element={<Store />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/news"       element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/callback"   element={<MokaCallback />} />
          <Route path="/loyalty"    element={<LoyaltyPage />} />
        </Routes>
      </Suspense>
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