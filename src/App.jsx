import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Menu from "./pages/Menu";
import Store from "./pages/Store";
import ContactUs from "./pages/ContactUs";

function App() {
  return (
    <Router basename="/website-s7">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/store" element={<Store />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Routes>
    </Router>
  );
}

export default App;