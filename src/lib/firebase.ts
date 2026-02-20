// Firebase 설정 — 환경변수에서 읽기
// .env.local 또는 Netlify 환경변수에 아래를 설정하세요:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID
// VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const db = getFirestore(app);
export default app;
