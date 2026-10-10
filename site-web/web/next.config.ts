import type { NextConfig } from "next";

/**
 * En-têtes de sécurité (phase 2, app-mobile/securite-phase2-protection-contenu.md, lot A).
 * - CSP : scripts uniquement depuis le site (le 'unsafe-inline' est imposé par
 *   les scripts en ligne de Next sans nonce) ; connexions uniquement vers le
 *   site et Supabase ; aucun plugin ; le site ne peut pas être affiché dans
 *   un cadre (frame-ancestors) par une page tierce.
 * - Images : toute adresse https (photos du catalogue stockées en base).
 */
const isDev = process.env.NODE_ENV === "development";
const SUPABASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://*.supabase.co").replace(/\/$/, "");
const SUPABASE_WS = SUPABASE.replace(/^https:/, "wss:");

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `media-src 'self' blob: ${SUPABASE}`,
  `connect-src 'self' ${SUPABASE} ${SUPABASE_WS}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=(), serial=(), hid=(), bluetooth=(), payment=(), display-capture=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
