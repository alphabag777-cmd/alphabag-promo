import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/project/:planId" element={<ProjectDetail />} />
        {/* 404 fallback */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-6xl font-extrabold text-white/10 mb-4">404</p>
              <p className="mb-6">페이지를 찾을 수 없습니다.</p>
              <a href="/" className="text-amber-400 hover:underline">홈으로 돌아가기</a>
            </div>
          </div>
        } />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
