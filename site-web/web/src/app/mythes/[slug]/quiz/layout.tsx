'use client';

import { ModuleGate } from '@/lib/settings';

/** Module « Quiz » coupé dans le back-office (Paramètres → Modules) : page « indisponible ». */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ModuleGate module="quiz">{children}</ModuleGate>;
}
