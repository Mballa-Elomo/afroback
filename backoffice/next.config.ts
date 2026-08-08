import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Par défaut, une Server Action ne peut recevoir que 1 Mo. Les uploads
    // de médias sont passés en Route Handler le 2026-08-06 (voir
    // lib/uploadMedia.ts, backoffice/README.md — bug d'upload via Server
    // Action multipart) et ne dépendent donc plus de ce réglage. Laissé en
    // place au cas où une future Server Action (métadonnées volumineuses,
    // par ex.) en aurait besoin — sans danger, une limite haute n'affecte
    // que ce qu'on autorise, jamais ce qui transite réellement. La limite
    // réelle du plan Supabase Storage (déjà rencontrée avec une vidéo héros
    // de 183 Mo, voir context/AFROBACK.md) reste un plafond séparé.
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
