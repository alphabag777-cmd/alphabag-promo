/** Navbar — 독립 홍보사이트 상단 헤더 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";
import { MAIN_APP_URL } from "../lib/utils";

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);


  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || open
          ? "bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/40"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <button
          className="flex items-center gap-2 group"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide">
            Alpha<span className="text-gradient">Bag</span>
          </span>
        </button>

        {/* 데스크탑 메뉴 */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className={[
              "text-sm font-medium transition-colors",
              location.pathname === "/"
                ? "text-amber-400"
                : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            프로젝트
          </button>
          <a
            href={`${MAIN_APP_URL}/#about`}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            AlphaBag 소개
          </a>
          <a
            href={`${MAIN_APP_URL}/community`}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            커뮤니티
          </a>
          <a
            href={MAIN_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25"
          >
            투자 시작하기 →
          </a>
        </nav>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white"
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {open && (
        <div className="md:hidden bg-[#0d0d14]/98 border-t border-white/5 px-4 py-4 space-y-3">
          <button
            className="block w-full text-left py-2 text-sm text-slate-300 hover:text-amber-400"
            onClick={() => { navigate("/"); setOpen(false); }}
          >
            프로젝트 목록
          </button>
          <a
            href={`${MAIN_APP_URL}/community`}
            className="block py-2 text-sm text-slate-300 hover:text-amber-400"
            onClick={() => setOpen(false)}
          >
            커뮤니티
          </a>
          <a
            href={MAIN_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold text-sm mt-2"
            onClick={() => setOpen(false)}
          >
            투자 시작하기 →
          </a>
        </div>
      )}
    </header>
  );
}
