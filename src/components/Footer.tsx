/** Footer — 독립 홍보사이트 하단 */
import { Zap } from "lucide-react";
import { MAIN_APP_URL } from "../lib/utils";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg">
                Alpha<span className="text-gradient">Bag</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              블록체인 기반 투자 플랫폼.<br />
              스마트 컨트랙트로 투명하고 안전하게.
            </p>
          </div>

          {/* 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/" className="hover:text-amber-400 transition-colors">프로젝트 목록</a></li>
              <li>
                <a href={MAIN_APP_URL} target="_blank" rel="noopener noreferrer"
                   className="hover:text-amber-400 transition-colors">
                  메인 투자 앱
                </a>
              </li>
              <li>
                <a href={`${MAIN_APP_URL}/community`} className="hover:text-amber-400 transition-colors">
                  커뮤니티
                </a>
              </li>
              <li>
                <a href={`${MAIN_APP_URL}/support`} className="hover:text-amber-400 transition-colors">
                  고객 지원
                </a>
              </li>
            </ul>
          </div>

          {/* 법적 고지 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">유의사항</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              본 페이지는 투자 권유를 목적으로 하지 않습니다.
              암호화폐 투자에는 원금 손실의 위험이 있으며,
              투자 결정은 본인 책임 하에 이루어져야 합니다.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-600">
          <span>© 2024–2026 AlphaBag. All rights reserved.</span>
          <span>Powered by BSC Mainnet</span>
        </div>
      </div>
    </footer>
  );
}
