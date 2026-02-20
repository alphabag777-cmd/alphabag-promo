/**
 * Home.tsx — AlphaBag 독립 홍보사이트 메인 페이지
 *
 * - Firebase에서 BBAG 플랜 자동 로드
 * - 히어로 → 통계 → Why BBAG → 프로젝트 카드 → 투자 방법 → CTA
 * - 지갑 연결 불필요 (순수 홍보 랜딩)
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBBAGPlans, type Plan } from "../lib/plans";
import { MAIN_APP_URL, parsePct } from "../lib/utils";
import {
  ArrowRight, Shield, TrendingUp, Zap,
  Star, Users, BarChart3, ChevronDown,
  Globe, Lock, Award, Sparkles, ExternalLink,
} from "lucide-react";

/* ── 카운트업 훅 ──────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1600, trigger = true) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setN(target); clearInterval(t); }
      else setN(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration, trigger]);
  return n;
}

/* ── 통계 카드 ────────────────────────────────────────────────── */
function StatCard({ value, suffix, prefix = "", label, visible }: {
  value: number; suffix: string; prefix?: string; label: string; visible: boolean;
}) {
  const n = useCountUp(value, 1600, visible);
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">
        {prefix}{n.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

/* ── 프로젝트 카드 ────────────────────────────────────────────── */
function PlanCard({ plan, rank, onClick }: {
  plan: Plan; rank: number; onClick: () => void;
}) {
  const isTop = rank === 1;
  const daily = parsePct(plan.dailyProfit);

  return (
    <article
      onClick={onClick}
      className={[
        "group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer card-hover",
        "bg-[#111118] border",
        isTop
          ? "border-amber-500/40 shadow-xl shadow-amber-500/10"
          : "border-white/8 hover:border-white/15",
      ].join(" ")}
    >
      {/* 상단 컬러 바 */}
      <div className={[
        "h-1 w-full",
        isTop
          ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300"
          : "bg-gradient-to-r from-slate-600 to-slate-500",
      ].join(" ")} />

      {/* TOP PICK 뱃지 */}
      {isTop && (
        <div className="absolute top-5 right-5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-400 text-xs font-bold">
          <Star className="w-3 h-3 fill-amber-400" />
          TOP PICK
        </div>
      )}

      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* 로고 + 이름 */}
        <div className="flex items-center gap-3 pr-20">
          {plan.logo ? (
            <img
              src={plan.logo} alt={plan.name}
              className="w-14 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
              onError={e => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-7 h-7 text-amber-400" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-base text-white leading-snug truncate">
              {plan.promoTitle || plan.name}
            </h3>
            <p className="text-xs text-slate-400 truncate">{plan.label}</p>
          </div>
        </div>

        {/* 일일 수익률 강조 박스 */}
        <div className="rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 px-4 py-4 text-center">
          <p className="text-xs text-slate-400 mb-1">일일 예상 수익률</p>
          <p className="text-4xl font-extrabold text-emerald-400 leading-none">
            {plan.dailyProfit || `${daily}%`}
          </p>
          {plan.promoHighlight ? (
            <p className="text-xs text-emerald-300/70 mt-1.5 font-medium">{plan.promoHighlight}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">매일 정산 · 복리 효과</p>
          )}
        </div>

        {/* 태그 */}
        {plan.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {plan.tags.slice(0, 4).map(tag => (
              <span key={tag}
                className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 설명 */}
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 flex-1">
          {plan.promoTagline || plan.description || plan.focus}
        </p>

        {/* 미니 지표 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {plan.minInvestment && (
            <Metric label="최소 투자" value={plan.minInvestment} />
          )}
          {plan.lockupPeriod && (
            <Metric label="락업 기간" value={plan.lockupPeriod} />
          )}
          {plan.network && (
            <Metric label="네트워크" value={plan.network} />
          )}
          {plan.riskLevel && (
            <Metric
              label="리스크"
              value={plan.riskLevel}
              valueClass={
                plan.riskLevel === "Low" ? "text-emerald-400"
                : plan.riskLevel === "High" ? "text-red-400"
                : "text-amber-400"
              }
            />
          )}
        </div>

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); onClick(); }}
          className={[
            "w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
            isTop
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 shadow-lg shadow-amber-500/25"
              : "bg-white/8 text-white border border-white/10 hover:bg-white/12",
          ].join(" ")}
        >
          자세히 보기
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

function Metric({ label, value, valueClass = "text-white" }: {
  label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="rounded-lg bg-white/4 px-3 py-2">
      <div className="text-slate-500 text-[10px] mb-0.5">{label}</div>
      <div className={`font-semibold text-xs ${valueClass}`}>{value}</div>
    </div>
  );
}

/* ── 메인 컴포넌트 ────────────────────────────────────────────── */
export default function Home() {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const refAddr     = params.get("ref") || "";
  const [plans, setPlans]   = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsVis, setStatsVis] = useState(false);
  const statsRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getBBAGPlans()
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVis(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const toDetail = (plan: Plan) => {
    const path = `/project/${plan.id}${refAddr ? `?ref=${refAddr}` : ""}`;
    navigate(path);
  };

  /* ── 히어로 배경 파티클 (CSS 전용, 퍼포먼스 안전) */
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 13) % 100}%`,
    top:  `${(i * 53 + 27) % 100}%`,
    delay: `${(i * 0.3) % 3}s`,
    size:  `${(i % 3) + 1}px`,
    opacity: 0.1 + (i % 5) * 0.06,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        {/* 배경 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-400/6 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-amber-600/4 rounded-full blur-[100px]" />
          {/* 파티클 */}
          {particles.map(p => (
            <div key={p.id} className="absolute rounded-full bg-amber-400 animate-pulse-slow"
              style={{ left: p.left, top: p.top, width: p.size, height: p.size, opacity: p.opacity, animationDelay: p.delay }} />
          ))}
        </div>

        {/* 그리드 패턴 오버레이 */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 animate-fade-up">
          {/* 상단 배지 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/8 text-amber-400 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AlphaBag 엄선 · BBAG 핵심 프로젝트
          </div>

          {/* 헤드라인 */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
            <span className="text-white">스마트한 투자자가</span>
            <br />
            <span className="text-gradient">선택한 BBAG</span>
          </h1>

          {/* 서브 카피 */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            블록체인 기반 투명한 투자 구조 ·{" "}
            <span className="text-white font-medium">매일 수익 지급</span>
            <br className="hidden sm:block" />
            AlphaBag이 직접 검증한 BBAG 프로젝트에만 집중합니다.
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-base hover:opacity-90 transition-opacity shadow-2xl shadow-amber-500/25 flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              프로젝트 보기
            </button>
            <a
              href={MAIN_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl border border-white/15 text-slate-300 font-medium text-base hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              메인 앱 바로가기
            </a>
          </div>

          {/* 스크롤 힌트 */}
          <div className="mt-20 flex justify-center animate-bounce text-slate-600">
            <ChevronDown className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* ════════════════ 통계 ════════════════ */}
      <section ref={statsRef} className="py-16 border-y border-white/5 bg-[#0d0d14]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value={1240} suffix="명+" label="누적 투자자" visible={statsVis} />
          <StatCard value={3800} suffix="K+" prefix="$" label="총 투자 금액" visible={statsVis} />
          <StatCard value={15}   suffix="%+" label="평균 일일 수익률" visible={statsVis} />
          <StatCard value={12}   suffix="개" label="파트너 프로젝트" visible={statsVis} />
        </div>
      </section>

      {/* ════════════════ WHY BBAG ════════════════ */}
      <section className="py-24 max-w-5xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Why BBAG
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-white">
            AlphaBag이 BBAG을 선택한 이유
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            수백 개의 DeFi 프로젝트 중 AlphaBag이 직접 검증한 이유가 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Shield className="w-6 h-6" />,
              color: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
              title: "스마트 컨트랙트 보안",
              desc: "BSC 메인넷 스마트 컨트랙트로 자금 관리. 제3자 감사 완료로 투명성 보장.",
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
              title: "매일 수익 지급",
              desc: "하루 단위로 정산되는 수익. 복리 효과로 장기 투자 시 더 큰 수익.",
            },
            {
              icon: <Zap className="w-6 h-6" />,
              color: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
              title: "즉시 참여 가능",
              desc: "복잡한 가입 절차 없음. 지갑 연결만으로 즉시 투자 참여 시작.",
            },
          ].map(item => (
            <div key={item.title}
              className={`p-6 rounded-2xl bg-gradient-to-b border ${item.color}`}>
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ 프로젝트 ════════════════ */}
      <section id="projects" className="py-20 bg-[#0d0d14]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Featured Projects
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-white">
              엄선된 BBAG 핵심 프로젝트
            </h2>
            <p className="mt-3 text-slate-400">
              직접 검증하고 선정한, 신뢰할 수 있는 투자 기회입니다.
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-96 rounded-2xl bg-white/4 animate-pulse" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>프로젝트 정보를 불러오는 중입니다…</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              plans.length === 1 ? "max-w-sm mx-auto"
              : plans.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto"
              : "sm:grid-cols-2 lg:grid-cols-3"
            }`}>
              {plans.map((p, i) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  rank={i + 1}
                  onClick={() => toDetail(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════ 투자 방법 3단계 ════════════════ */}
      <section className="py-24 max-w-4xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-white">3단계로 시작하는 BBAG 투자</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-amber-400/30 via-amber-400/60 to-amber-400/30" />
          {[
            { n: "01", icon: <Globe className="w-5 h-5" />, title: "지갑 연결", desc: "MetaMask 또는 WalletConnect로 BSC 지갑 연결" },
            { n: "02", icon: <Star className="w-5 h-5" />, title: "프로젝트 선택", desc: "이 페이지에서 원하는 BBAG 프로젝트를 선택" },
            { n: "03", icon: <TrendingUp className="w-5 h-5" />, title: "USDT 입금 → 수익 시작", desc: "매일 수익이 지급되며 복리 효과 누적 시작" },
          ].map(s => (
            <div key={s.n} className="relative z-10 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 mx-auto mb-4">
                {s.icon}
              </div>
              <div className="text-xs text-amber-400 font-mono font-bold mb-2">{s.n}</div>
              <h3 className="font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ 신뢰 배지 ════════════════ */}
      <section className="py-12 border-y border-white/5 bg-[#0d0d14]">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Lock className="w-4 h-4" />, text: "스마트 컨트랙트\n감사 완료" },
            { icon: <Shield className="w-4 h-4" />, text: "BSC 메인넷\n검증 완료" },
            { icon: <Award className="w-4 h-4" />, text: "24/7 실시간\n수익 정산" },
            { icon: <Users className="w-4 h-4" />, text: "레퍼럴 보상\n프로그램 운영" },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-2 px-4 py-4">
              <div className="w-9 h-9 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400">
                {b.icon}
              </div>
              <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[500px] h-[500px] bg-amber-400/8 rounded-full blur-[100px]" />
          </div>
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            지금 바로
            <span className="text-gradient"> 수익을 </span>
            시작하세요
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            수천 명의 투자자들이 이미 AlphaBag과 함께하고 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={refAddr ? `${MAIN_APP_URL}/?referral=${refAddr}` : MAIN_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-lg hover:opacity-90 transition-opacity shadow-2xl shadow-amber-500/25 flex items-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              지금 투자 시작하기
            </a>
            <button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-xl border border-white/15 text-slate-300 font-medium text-base hover:bg-white/5 transition-colors"
            >
              프로젝트 다시 보기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
