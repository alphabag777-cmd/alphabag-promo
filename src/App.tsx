/**
 * App.tsx
 *
 * 라우팅:
 *   /         → NotFound (planId 없음)
 *   /:planId  → PromoLanding (planId + ?ref=0x...)
 *
 * 사용 예:
 *   https://my-promo.netlify.app/BBAG-001?ref=0xABCDEF...
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PromoLanding from "./pages/PromoLanding";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4">
      <div>
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-white text-2xl font-bold mb-2">플랜을 지정해 주세요</h1>
        <p className="text-slate-400 text-sm">
          URL 형식: <code className="text-yellow-400">/{"{planId}"}?ref={"{referralAddress}"}</code>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NotFound />} />
        <Route path="/:planId" element={<PromoLanding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
