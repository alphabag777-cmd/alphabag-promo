import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 일일 수익률 문자열에서 숫자만 추출 */
export function parsePct(val: string): number {
  return parseFloat(val?.replace(/[^0-9.]/g, "") || "0") || 0;
}

/** 주소 단축 표시 */
export function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** 클립보드 복사 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** 메인 앱 URL */
export const MAIN_APP_URL =
  import.meta.env.VITE_MAIN_APP_URL || "https://mywork-alpha.netlify.app";
