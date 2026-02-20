/**
 * PromoLanding.tsx
 *
 * URL 패턴: /:planId?ref=0xABC...
 * - planId 로 Firebase에서 단일 플랜 로드
 * - ref 파라미터로 레퍼럴 주소 내장
 * - "지금 투자하기" → 메인앱 /investment?ref=0xABC...&plan=planId 로 이동
 * - 완전 독립 사이트, 지갑 연결 없음
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getPlanById, type Plan } from "../lib/plans";
import { MAIN_APP_URL } from "../lib/utils";
import {
  Copy, Check, ExternalLink, Share2, Shield,
  TrendingUp, Clock, ChevronDown,
  Star, Award, Globe, MessageCircle, Twitter,
  ArrowRight, Play, Info, AlertTriangle, Lock,
  Flame, BarChart2, Target, Gift,
} from "lucide-react";

/* ── 유틸 ──────────────────────────────────────────────────────── */
function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function useCountUp(target: number, duration = 2000, trigger = true) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!trigger || target === 0) return;
    let cur = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setN(target); clearInterval(id); }
      else setN(Math.floor(cur));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration, trigger]);
  return n;
}

/* ── 파티클 배경 ────────────────────────────────────────────────── */
function ParticlesBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(250,189,0,0.25)";
        ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(250,189,0,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }));
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ── 복사 버튼 ─────────────────────────────────────────────────── */
function CopyBtn({ text, label, className = "" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copied ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/10 hover:bg-white/20 text-white border border-white/20"} ${className}`}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "복사됨!" : (label ?? "복사")}
    </button>
  );
}

/* ── FAQ 아이템 ──────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl transition-all ${open ? "border-yellow-500/40 bg-yellow-500/5" : "border-white/10 bg-white/5"}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-medium text-white text-sm md:text-base">{q}</span>
        <ChevronDown size={18} className={`text-yellow-400 transition-transform flex-shrink-0 ml-3 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-4 text-slate-300 text-sm leading-relaxed">{a}</div>}
    </div>
  );
}

/* ── 카운트업 스탯 ──────────────────────────────────────────────── */
function Stat({ value, suffix, label, visible }: { value: number; suffix: string; label: string; visible: boolean }) {
  const n = useCountUp(value, 1800, visible);
  return (
    <div className="text-center px-4">
      <div className="text-2xl md:text-4xl font-extrabold text-yellow-400">{n.toLocaleString()}{suffix}</div>
      <div className="text-xs md:text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────────── */
export default function PromoLanding() {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const refAddr = searchParams.get("ref") ?? "";

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsVisible, setStatsVisible] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  // 레퍼럴 링크 (현재 페이지 URL 그대로)
  const promoUrl = typeof window !== "undefined" ? window.location.href : "";
  // 메인앱 투자 URL
  const investUrl = refAddr
    ? `${MAIN_APP_URL}/investment?ref=${refAddr}${planId ? `&plan=${planId}` : ""}`
    : `${MAIN_APP_URL}/investment${planId ? `?plan=${planId}` : ""}`;

  // 공유 URL
  const shareUrl = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: plan?.name ?? "AlphaBag", url: promoUrl });
    } else {
      navigator.clipboard.writeText(promoUrl);
    }
  }, [plan, promoUrl]);

  useEffect(() => {
    if (!planId) { setError("플랜 ID가 없습니다."); setLoading(false); return; }
    getPlanById(planId).then(p => {
      if (!p) setError("플랜을 찾을 수 없습니다.");
      else setPlan(p);
    }).catch(() => setError("데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [planId]);

  // Intersection Observer for stats counter
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // 이미지 자동 슬라이드
  const images: string[] = plan?.detailImages?.map(i => typeof i === "string" ? i : i.url).filter(Boolean) ?? [];
  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setImgIdx(n => (n + 1) % images.length), 4000);
    return () => clearInterval(id);
  }, [images.length]);

  /* ── 로딩 ── */
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">로딩 중…</p>
      </div>
    </div>
  );

  /* ── 에러 ── */
  if (error || !plan) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4">
      <div>
        <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
        <p className="text-white text-xl font-bold mb-2">페이지를 불러올 수 없습니다</p>
        <p className="text-slate-400">{error}</p>
      </div>
    </div>
  );

  const title = plan.promoTitle || plan.name;
  const tagline = plan.promoTagline || plan.focus || plan.description?.slice(0, 60);
  const highlight = plan.promoHighlight || (plan.dailyProfit ? `일 ${plan.dailyProfit} 수익` : "");
  const riskColor = plan.riskLevel === "Low" ? "text-green-400" : plan.riskLevel === "High" ? "text-red-400" : "text-yellow-400";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-['Inter',sans-serif] overflow-x-hidden">
      <ParticlesBg />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 pt-16 pb-8">
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-600/6 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          {/* 배지 */}
          {refAddr && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 rounded-full px-4 py-1.5 text-yellow-300 text-xs font-medium mb-6">
              <Gift size={12} />
              <span>{shortAddr(refAddr)}님의 초대 링크</span>
            </div>
          )}

          {/* 로고 + 제목 */}
          <div className="flex items-center gap-4 mb-4">
            {plan.logo && (
              <img src={plan.logo} alt={title}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-yellow-500/30 bg-black/40 object-contain p-1 flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            <div>
              <p className="text-yellow-400 text-xs md:text-sm font-semibold uppercase tracking-widest mb-1">{plan.label || "BBAG"}</p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight
                bg-gradient-to-r from-white via-yellow-100 to-yellow-400 bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
          </div>

          {/* 태그라인 */}
          <p className="text-slate-300 text-base md:text-xl leading-relaxed mb-4 max-w-2xl">
            {tagline}
          </p>

          {/* 하이라이트 뱃지 */}
          {highlight && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20
              border border-yellow-500/40 rounded-xl px-4 py-2 mb-8">
              <Flame size={16} className="text-yellow-400" />
              <span className="text-yellow-300 font-bold text-sm md:text-base">{highlight}</span>
            </div>
          )}

          {/* 태그 */}
          {plan.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {plan.tags.map(t => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/8 border border-white/10 text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a href={investUrl} target="_blank" rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-black text-base md:text-lg
                bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400
                shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-200 hover:scale-105">
              지금 투자하기
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            {plan.dappUrl && (
              <a href={plan.dappUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white text-base
                  border border-white/20 bg-white/5 hover:bg-white/10 transition-all">
                <Globe size={18} />
                공식 dApp 방문
              </a>
            )}
          </div>

          {/* 레퍼럴 링크 공유 박스 */}
          {refAddr && (
            <div className="bg-white/5 border border-yellow-500/20 rounded-2xl p-4 max-w-xl">
              <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Share2 size={12} /> 내 레퍼럴 홍보 링크
              </p>
              <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-2 border border-white/10">
                <span className="text-slate-300 text-xs truncate flex-1">{promoUrl}</span>
                <CopyBtn text={promoUrl} label="복사" />
              </div>
              <button onClick={shareUrl}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-slate-400
                  hover:text-white hover:bg-white/5 transition-all border border-white/10">
                <Share2 size={14} /> 공유하기
              </button>
            </div>
          )}
        </div>

        {/* 스크롤 안내 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown size={24} className="text-yellow-500/60" />
        </div>
      </section>

      {/* ── 핵심 지표 ─────────────────────────────────────────────── */}
      <section ref={statsRef} className="relative z-10 py-12 border-y border-white/8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-x-0 md:divide-x divide-white/10">
            <Stat value={parseInt(plan.dailyProfit ?? "2") || 2} suffix="%" label="일 수익률" visible={statsVisible} />
            <Stat value={parseInt(plan.lockupPeriod ?? "90") || 90} suffix="일" label="락업 기간" visible={statsVisible} />
            <Stat value={parseInt((plan.totalCapacity ?? "5000").replace(/,/g, "")) || 5000} suffix="+" label="총 캐파시티" visible={statsVisible} />
            <Stat value={parseInt((plan.currentParticipants ?? "1200").replace(/,/g, "")) || 1200} suffix="+" label="참여자 수" visible={statsVisible} />
          </div>
        </div>
      </section>

      {/* ── 상품 상세 카드 ────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">상품 상세 정보</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: <BarChart2 size={18} className="text-yellow-400" />, label: "일 수익률", value: plan.dailyProfit ? `${plan.dailyProfit}%` : "-" },
              { icon: <Clock size={18} className="text-blue-400" />, label: "투자 기간", value: plan.investmentPeriod || plan.lockupPeriod || "-" },
              { icon: <TrendingUp size={18} className="text-green-400" />, label: "수익 지급", value: plan.profitCycle || "매일" },
              { icon: <Target size={18} className="text-purple-400" />, label: "최소 투자", value: plan.minInvestment || "-" },
              { icon: <Shield size={18} className="text-cyan-400" />, label: "리스크 레벨", value: <span className={riskColor}>{plan.riskLevel || "Medium"}</span> },
              { icon: <Globe size={18} className="text-orange-400" />, label: "네트워크", value: plan.network || "BSC" },
              { icon: <Lock size={18} className="text-pink-400" />, label: "락업 기간", value: plan.lockupPeriod || "-" },
              { icon: <Info size={18} className="text-slate-400" />, label: "수수료", value: plan.feeInfo || "-" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-yellow-500/30 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 토큰 심볼 + 컨트랙트 */}
          {(plan.tokenSymbol || plan.contractAddress) && (
            <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex flex-wrap gap-4 items-center">
                {plan.tokenSymbol && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">토큰</p>
                    <span className="text-yellow-400 font-bold">{plan.tokenSymbol}</span>
                  </div>
                )}
                {plan.contractAddress && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-0.5">컨트랙트 주소</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 font-mono truncate">{plan.contractAddress}</span>
                      <CopyBtn text={plan.contractAddress} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 하이라이트 카드 ───────────────────────────────────────── */}
      {plan.highlights && plan.highlights.length > 0 && (
        <section className="relative z-10 py-12 px-4 bg-gradient-to-b from-transparent via-yellow-500/3 to-transparent">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              핵심 <span className="text-yellow-400">강점</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.highlights.map((h, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all group">
                  <div className="text-3xl mb-3">{h.icon || "⭐"}</div>
                  <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1">{h.title}</p>
                  <p className="text-white font-bold text-lg">{h.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 이미지 갤러리 ────────────────────────────────────────── */}
      {images.length > 0 && (
        <section className="relative z-10 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              프로젝트 <span className="text-yellow-400">갤러리</span>
            </h2>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/40">
              <img src={images[imgIdx]} alt={`gallery-${imgIdx}`}
                className="w-full h-full object-contain transition-opacity duration-500"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-yellow-400 w-5" : "bg-white/30"}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 설명 ─────────────────────────────────────────────────── */}
      {(plan.detailDescription || plan.description) && (
        <section className="relative z-10 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              프로젝트 <span className="text-yellow-400">소개</span>
            </h2>
            <div className="prose prose-invert prose-sm md:prose-base max-w-none
              text-slate-300 leading-relaxed whitespace-pre-wrap">
              {plan.detailDescription || plan.description}
            </div>
          </div>
        </section>
      )}

      {/* ── YouTube ──────────────────────────────────────────────── */}
      {plan.youtubeUrl && (
        <section className="relative z-10 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
              <Play size={24} className="text-red-500" />
              소개 <span className="text-yellow-400">영상</span>
            </h2>
            <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video">
              <iframe
                src={plan.youtubeUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
          </div>
        </section>
      )}

      {/* ── 투자 방법 3단계 ──────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 bg-gradient-to-b from-transparent via-white/2 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            투자 <span className="text-yellow-400">3단계</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: <ExternalLink size={22} />, title: "메인앱 접속", desc: "아래 버튼으로 AlphaBag 메인 앱에 접속합니다." },
              { step: "02", icon: <Shield size={22} />, title: "지갑 연결", desc: "MetaMask 또는 WalletConnect로 지갑을 연결하세요." },
              { step: "03", icon: <TrendingUp size={22} />, title: "투자 실행", desc: `${title} 상품을 선택하고 투자 금액을 입력합니다.` },
            ].map(({ step, icon, title: t, desc }) => (
              <div key={step} className="relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition-all text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600
                  flex items-center justify-center text-black text-xs font-black shadow-lg shadow-yellow-500/30">{step}</div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center
                  text-yellow-400 mx-auto mb-3 mt-2">{icon}</div>
                <h3 className="font-bold text-white mb-2">{t}</h3>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href={investUrl} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-black text-lg
                bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400
                shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all hover:scale-105">
              메인앱으로 투자하기
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 소셜 링크 ────────────────────────────────────────────── */}
      {(plan.telegram || plan.twitter) && (
        <section className="relative z-10 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-center mb-6 text-slate-300">커뮤니티 참여</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {plan.telegram && (
                <a href={plan.telegram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300
                    hover:bg-blue-500/25 transition-all font-medium">
                  <MessageCircle size={18} /> 텔레그램
                </a>
              )}
              {plan.twitter && (
                <a href={plan.twitter} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300
                    hover:bg-sky-500/25 transition-all font-medium">
                  <Twitter size={18} /> Twitter / X
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">자주 묻는 질문</h2>
          <div className="space-y-3">
            <FaqItem q="어떻게 투자를 시작하나요?" a="위의 '지금 투자하기' 버튼을 클릭하면 AlphaBag 메인 앱으로 이동합니다. MetaMask 또는 WalletConnect로 지갑을 연결한 후, 투자 금액을 입력하면 됩니다." />
            <FaqItem q="최소 투자 금액은 얼마인가요?" a={`최소 투자 금액은 ${plan.minInvestment || "상품에 따라 다르며, 메인 앱에서 확인"}입니다.`} />
            <FaqItem q="수익은 언제 받을 수 있나요?" a={`수익 지급 주기는 ${plan.profitCycle || "매일"}입니다. 지갑에 직접 지급됩니다.`} />
            <FaqItem q="레퍼럴 링크는 어떻게 작동하나요?" a="위의 레퍼럴 링크를 지인에게 공유하면, 지인이 해당 링크로 투자 시 레퍼럴 보너스가 적립됩니다." />
            <FaqItem q="투자 자금은 안전한가요?" a={plan.auditInfo || "AlphaBag는 스마트 컨트랙트를 통해 투자 자금을 관리하며, 모든 트랜잭션은 블록체인에 기록됩니다. 투자 전 반드시 리스크를 충분히 숙지하세요."} />
          </div>
        </div>
      </section>

      {/* ── 최하단 CTA ───────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-yellow-500/10 via-amber-500/8 to-transparent border border-yellow-500/20 rounded-3xl p-10 md:p-14">
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 rounded-full px-4 py-1.5 text-yellow-300 text-xs font-semibold mb-6">
              <Star size={12} /> LIMITED OPPORTUNITY
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              지금 바로<br />
              <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                {title}에 투자하세요
              </span>
            </h2>
            <p className="text-slate-300 text-base md:text-lg mb-8 max-w-xl mx-auto">
              {plan.noticeText || "한정된 투자 기회를 놓치지 마세요. 지금 시작하면 레퍼럴 보너스까지 받을 수 있습니다."}
            </p>
            <a href={investUrl} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-black text-xl
                bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400
                shadow-2xl shadow-yellow-500/40 hover:shadow-yellow-500/60 transition-all hover:scale-105">
              투자 시작하기
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </a>
            {refAddr && (
              <p className="mt-4 text-xs text-slate-500">
                레퍼럴: <span className="text-yellow-600 font-mono">{shortAddr(refAddr)}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── 면책조항 ─────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/8 py-8 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Award size={16} className="text-yellow-500" />
            <span className="text-yellow-400 font-bold text-sm">AlphaBag</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            본 페이지는 정보 제공 및 홍보 목적으로만 제공됩니다. 암호화폐 투자에는 원금 손실 위험이 있습니다.
            투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.
          </p>
          <p className="text-slate-700 text-xs mt-2">© 2026 AlphaBag. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
