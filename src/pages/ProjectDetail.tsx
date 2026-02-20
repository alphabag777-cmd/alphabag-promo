/**
 * ProjectDetail.tsx — 개별 프로젝트 상세 홍보 페이지
 *
 * URL: /project/:planId?ref=<walletAddress>
 * - Firebase에서 planId로 플랜 상세 로드
 * - ?ref= 파라미터 → 투자 버튼 클릭 시 메인 앱 레퍼럴 이동
 * - 지갑 미연결 상태에서도 완전 열람 가능
 */

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getPlanById, type Plan } from "../lib/plans";
import { MAIN_APP_URL, copyToClipboard, shortAddr } from "../lib/utils";
import {
  ArrowLeft, ArrowRight, TrendingUp, Clock, Globe, Wallet,
  ExternalLink, Copy, CheckCheck, Star, BarChart3,
  Layers, AlertTriangle, Youtube, Send, Twitter,
  Sparkles, Info,
} from "lucide-react";

/* ── 리스크 컬러 ─────────────────────────────────────────────── */
const riskBadge = (r?: string) =>
  r === "Low"  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
: r === "High" ? "text-red-400 bg-red-400/10 border-red-400/30"
: "text-amber-400 bg-amber-400/10 border-amber-400/30";

/* ── 공통 미니 카드 ────────────────────────────────────────────── */
function KpiCard({ icon, label, value, valueClass = "text-white" }: {
  icon: React.ReactNode; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-[#111118] border border-white/8 text-center">
      <span className="text-amber-400">{icon}</span>
      <span className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

/* ── 메인 컴포넌트 ────────────────────────────────────────────── */
export default function ProjectDetail() {
  const { planId }   = useParams<{ planId: string }>();
  const [params]     = useSearchParams();
  const navigate     = useNavigate();
  const refAddr      = params.get("ref") || "";

  const [plan, setPlan]     = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!planId) return;
    getPlanById(planId)
      .then(setPlan)
      .finally(() => setLoading(false));
  }, [planId]);

  /* 홍보 링크 (현재 사이트 기준) */
  const shareUrl = `${window.location.origin}/project/${planId}${refAddr ? `?ref=${refAddr}` : ""}`;

  const handleCopy = async () => {
    if (await copyToClipboard(shareUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* 메인 앱 투자 링크 */
  const investUrl = (() => {
    const u = new URL(`${MAIN_APP_URL}/investment`);
    if (planId) u.searchParams.set("plan", planId);
    if (refAddr) u.searchParams.set("referral", refAddr);
    return u.toString();
  })();

  /* 상세 이미지 정규화 */
  const detailImages: { url: string; caption?: string }[] =
    (plan?.detailImages || []).map(img =>
      typeof img === "string" ? { url: img } : img
    );

  /* ─── 로딩 ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="w-10 h-10 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-sm">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  /* ─── 플랜 없음 ────────────────────────────────────────────── */
  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 flex flex-col items-center justify-center gap-4">
        <BarChart3 className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400">프로젝트를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-xl border border-white/15 text-slate-300 text-sm hover:bg-white/5 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-40">

      {/* ── 뒤로가기 ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          모든 프로젝트 보기
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 space-y-8">

        {/* ── 히어로 헤더 카드 ───────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-400/20 bg-[#111118] shadow-2xl shadow-amber-400/5">
          {/* 배경 글로우 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-400/5 rounded-full blur-[80px]" />
          </div>
          <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />

          <div className="p-6 md:p-8 relative z-10">
            <div className="flex flex-col sm:flex-row gap-6">

              {/* 로고 */}
              <div className="flex-shrink-0">
                {plan.logo ? (
                  <img src={plan.logo} alt={plan.name}
                    className="w-24 h-24 rounded-2xl object-cover border border-white/10 shadow-lg"
                    onError={e => (e.currentTarget.style.display = "none")} />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-amber-400/10 flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-amber-400" />
                  </div>
                )}
              </div>

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" /> BBAG
                  </span>
                  {plan.status && (
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-slate-300 text-xs">
                      {plan.status}
                    </span>
                  )}
                  {plan.riskLevel && (
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${riskBadge(plan.riskLevel)}`}>
                      Risk: {plan.riskLevel}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1 leading-tight">
                  {plan.promoTitle || plan.name}
                </h1>
                <p className="text-slate-400 text-sm mb-3">{plan.label}</p>
                {plan.focus && (
                  <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{plan.focus}</p>
                )}
                {plan.promoTagline && (
                  <p className="mt-2 text-amber-400/80 text-sm font-medium italic">"{plan.promoTagline}"</p>
                )}
              </div>

              {/* 일일 수익률 박스 */}
              <div className="flex-shrink-0 text-center rounded-2xl bg-gradient-to-b from-emerald-400/12 to-transparent border border-emerald-400/20 px-6 py-5 min-w-[120px]">
                <p className="text-xs text-slate-400 mb-1">일일 수익률</p>
                <p className="text-4xl font-extrabold text-emerald-400 leading-none">{plan.dailyProfit}</p>
                <p className="text-[10px] text-slate-500 mt-1.5">매일 정산</p>
              </div>
            </div>

            {/* 태그 */}
            {plan.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {plan.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── KPI 그리드 ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="일일 수익률" value={plan.dailyProfit} valueClass="text-emerald-400" />
          <KpiCard icon={<Clock className="w-4 h-4" />}      label="락업 기간"  value={plan.lockupPeriod || "-"} />
          <KpiCard icon={<Wallet className="w-4 h-4" />}     label="최소 투자"  value={plan.minInvestment || "-"} />
          <KpiCard icon={<Globe className="w-4 h-4" />}      label="네트워크"   value={plan.network || "BSC"} />
        </div>

        {/* ── 상세 설명 ──────────────────────────────────────── */}
        {(plan.detailDescription || plan.description) && (
          <div className="rounded-2xl bg-[#111118] border border-white/8 p-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-base">
              <Info className="w-4 h-4 text-amber-400" />
              프로젝트 상세 설명
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
              {plan.detailDescription || plan.description}
            </p>
          </div>
        )}

        {/* ── 핵심 지표 하이라이트 ───────────────────────────── */}
        {plan.highlights && plan.highlights.length > 0 && (
          <div>
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              핵심 지표
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {plan.highlights.map((h, i) => (
                <div key={i} className="text-center p-5 rounded-2xl bg-amber-400/5 border border-amber-400/15">
                  <div className="text-3xl mb-2">{h.icon}</div>
                  <p className="text-xs text-slate-400 mb-1">{h.title}</p>
                  <p className="font-bold text-white">{h.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 이미지 갤러리 ────────────────────────────────────── */}
        {detailImages.length > 0 && (
          <div>
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              프로젝트 자료
            </h2>
            <div className="relative rounded-2xl overflow-hidden border border-white/8">
              <img
                src={detailImages[activeImg].url}
                alt={detailImages[activeImg].caption || `image ${activeImg+1}`}
                className="w-full object-cover max-h-96"
              />
              {detailImages[activeImg].caption && (
                <div className="bg-black/50 text-center text-xs text-slate-300 py-2 px-4">
                  {detailImages[activeImg].caption}
                </div>
              )}
              {detailImages.length > 1 && (
                <div className="flex gap-2 justify-center py-3 bg-[#111118]">
                  {detailImages.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i===activeImg ? "bg-amber-400" : "bg-white/20"}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 투자 정보 테이블 ──────────────────────────────── */}
        <div className="rounded-2xl bg-[#111118] border border-white/8 p-6">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            투자 정보
          </h2>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            {[
              { label: "투자 기간",      value: plan.investmentPeriod },
              { label: "수익 지급 주기", value: plan.profitCycle },
              { label: "수수료",         value: plan.feeInfo },
              { label: "토큰 심볼",      value: plan.tokenSymbol },
              { label: "감사 정보",      value: plan.auditInfo },
              { label: "총 모집 한도",   value: plan.totalCapacity },
              { label: "현재 참여자",    value: plan.currentParticipants },
              { label: "컨트랙트",       value: plan.contractAddress },
            ].filter(r => !!r.value).map(row => (
              <div key={row.label} className="flex justify-between items-start py-2.5 border-b border-white/5 last:border-0">
                <dt className="text-slate-500 flex-shrink-0">{row.label}</dt>
                <dd className="font-medium text-white text-right ml-4 break-all">
                  {row.label === "컨트랙트" ? (
                    <a href={`https://bscscan.com/token/${row.value}`}
                       target="_blank" rel="noopener noreferrer"
                       className="text-amber-400 hover:underline flex items-center gap-1 justify-end">
                      {row.value!.slice(0,8)}…{row.value!.slice(-6)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── 주의사항 ─────────────────────────────────────────── */}
        {plan.noticeText && (
          <div className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-200/80 leading-relaxed whitespace-pre-line">
              {plan.noticeText}
            </p>
          </div>
        )}

        {/* ── 소셜 링크 ─────────────────────────────────────────── */}
        {(plan.dappUrl || plan.youtubeUrl || plan.telegram || plan.twitter) && (
          <div className="flex flex-wrap gap-3">
            {plan.dappUrl && (
              <a href={plan.dappUrl} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/12 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                <Globe className="w-4 h-4" /> 공식 사이트
              </a>
            )}
            {plan.youtubeUrl && (
              <a href={plan.youtubeUrl} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/12 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                <Youtube className="w-4 h-4" /> YouTube
              </a>
            )}
            {plan.telegram && (
              <a href={plan.telegram} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/12 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                <Send className="w-4 h-4" /> Telegram
              </a>
            )}
            {plan.twitter && (
              <a href={plan.twitter} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/12 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                <Twitter className="w-4 h-4" /> X / Twitter
              </a>
            )}
          </div>
        )}

      </main>

      {/* ── Sticky CTA 바 ────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0d0d14]/95 backdrop-blur-xl border-t border-white/8 shadow-2xl shadow-black/60">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

            {/* 홍보링크 복사 */}
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 text-sm text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
            >
              {copied ? (
                <><CheckCheck className="w-4 h-4 text-emerald-400" /> 링크 복사됨!</>
              ) : (
                <><Copy className="w-4 h-4" /> 홍보 링크 복사</>
              )}
            </button>

            {/* 투자하기 */}
            <a
              href={investUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-base hover:opacity-90 transition-opacity shadow-xl shadow-amber-500/25"
            >
              <ArrowRight className="w-5 h-5" />
              지금 투자하기
            </a>
          </div>

          {/* 레퍼럴 안내 */}
          {refAddr && (
            <p className="text-xs text-center text-slate-500 mt-2">
              이 링크로 투자하면{" "}
              <span className="text-amber-400/80 font-medium">{shortAddr(refAddr)}</span>
              님에게 레퍼럴 보상이 적립됩니다
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
