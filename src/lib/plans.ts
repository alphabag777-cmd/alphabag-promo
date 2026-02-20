// 메인 앱(mywork)의 investment_plans 컬렉션을 그대로 읽는 최소 타입 정의 + 함수

import {
  collection, getDocs, getDoc, doc,
  query, orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Plan {
  detailDescription?: string;
  id: string;
  name: string;
  label: string;
  dailyProfit: string;
  description: string;
  focus: string;
  logo: string;
  dappUrl: string;
  tags: string[];
  status?: string;
  tokenSymbol?: string;
  network?: string;
  riskLevel?: "Low" | "Medium" | "High";
  minInvestment?: string;
  lockupPeriod?: string;
  investmentPeriod?: string;
  profitCycle?: string;
  feeInfo?: string;
  contractAddress?: string;
  auditInfo?: string;
  totalCapacity?: string;
  currentParticipants?: string;
  noticeText?: string;
  highlights?: Array<{ icon: string; title: string; value: string }>;
  detailImages?: Array<{ url: string; caption?: string } | string>;
  youtubeUrl?: string;
  telegram?: string;
  twitter?: string;
  wallet1Percentage?: number;
  sortOrder?: number;
  // 홍보 페이지 전용 옵션 필드
  promoTitle?: string;      // 홍보용 별도 제목 (없으면 name 사용)
  promoTagline?: string;    // 한 줄 슬로건
  promoHighlight?: string;  // 강조 문구 (예: "연 수익률 최대 200%")
}

const COLLECTION = "investment_plans";

function fromDoc(id: string, d: any): Plan {
  return {
    id,
    name:              d.name              || "",
    label:             d.label             || "",
    dailyProfit:       d.dailyProfit       || "",
    description:       d.description       || "",
    focus:             d.focus             || "",
    logo:              d.logo              || "",
    dappUrl:           d.dappUrl           || "",
    tags:              d.tags              || [],
    status:            d.status,
    tokenSymbol:       d.tokenSymbol,
    network:           d.network,
    riskLevel:         d.riskLevel,
    minInvestment:     d.minInvestment,
    lockupPeriod:      d.lockupPeriod,
    investmentPeriod:  d.investmentPeriod,
    profitCycle:       d.profitCycle,
    feeInfo:           d.feeInfo,
    contractAddress:   d.contractAddress,
    auditInfo:         d.auditInfo,
    totalCapacity:     d.totalCapacity,
    currentParticipants: d.currentParticipants,
    noticeText:        d.noticeText,
    highlights:        d.highlights        || [],
    detailImages:      d.detailImages      || [],
    youtubeUrl:        d.youtubeUrl,
    telegram:          d.telegram,
    twitter:           d.twitter,
    wallet1Percentage: d.wallet1Percentage || 0,
    sortOrder:         d.sortOrder         ?? 999,
    promoTitle:        d.promoTitle,
    promoTagline:      d.promoTagline,
    promoHighlight:    d.promoHighlight,
    detailDescription: d.detailDescription,
  };
}

// BBAG 플랜 = wallet1Percentage > 0 인 플랜
export async function getBBAGPlans(): Promise<Plan[]> {
  try {
    const snap = await getDocs(
      query(collection(db, COLLECTION), orderBy("sortOrder", "asc"))
    );
    return snap.docs
      .map(d => fromDoc(d.id, d.data()))
      .filter(p => (p.wallet1Percentage ?? 0) > 0);
  } catch (e) {
    console.error("getBBAGPlans error:", e);
    return [];
  }
}

export async function getPlanById(id: string): Promise<Plan | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    return snap.exists() ? fromDoc(snap.id, snap.data()) : null;
  } catch (e) {
    console.error("getPlanById error:", e);
    return null;
  }
}
