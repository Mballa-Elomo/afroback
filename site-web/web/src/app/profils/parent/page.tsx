'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMember } from '@/lib/auth';
import { ageLabel, childProfiles, childStats, formatMinutes, PARENT_OK, updateChild, type ChildProfile } from '@/lib/kids';
import { KidAvatar, PinGate } from '@/components/kids';
import { timeAgo, type Lang } from '@/lib/lang';
import { useLang } from '@/lib/lang-client';


type Stats = Awaited<ReturnType<typeof childStats>>;
const VALIDITY = 10 * 60 * 1000;

const since = (iso: string, lang: Lang) => timeAgo(iso, lang);

/**
 * Espace Parent, comme dans l'app (app/profils/parent.tsx) : temps réel passé
 * aujourd'hui (sessions closes uniquement, jamais estimé), dernière
 * activité, limite d'écran (informative en V1), Découverte activée.
 * Protégé par le code PIN, valable 10 minutes dans cet onglet.
 */
export default function EspaceParent() {
  const { ready, session, member } = useMember();
  const { tr, lang } = useLang();
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [askPin, setAskPin] = useState(false);
  const [children, setChildren] = useState<ChildProfile[] | null>(null);
  const [stats, setStats] = useState<Record<string, Stats>>({});

  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/profils');
    try {
      const t = Number(sessionStorage.getItem(PARENT_OK) ?? 0);
      if (Date.now() - t < VALIDITY) setUnlocked(true);
      else setAskPin(true);
    } catch {
      setAskPin(true);
    }
  }, [ready, session, router]);

  const load = useCallback(async () => {
    const list = await childProfiles();
    setChildren(list);
    list.forEach((c) => childStats(c.id).then((s) => setStats((p) => ({ ...p, [c.id]: s }))).catch(() => {}));
  }, []);
  useEffect(() => {
    if (member && unlocked) load();
  }, [member, unlocked, load]);

  const patch = async (c: ChildProfile, p: Partial<ChildProfile>) => {
    setChildren((l) => l?.map((x) => (x.id === c.id ? { ...x, ...p } : x)) ?? null);
    const r = await updateChild(c.id, p);
    if (r.error) load();
  };

  if (!unlocked)
    return (
      <div className="min-h-screen">
        <PinGate
          open={askPin}
          onCancel={() => router.replace('/profils')}
          onSuccess={() => {
            try {
              sessionStorage.setItem(PARENT_OK, String(Date.now()));
            } catch {}
            setAskPin(false);
            setUnlocked(true);
          }}
        />
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-5 pb-16 pt-32">
      <Link href="/profils" className="text-sm font-semibold text-gold">
        ‹ {tr('Qui regarde ?', "Who's watching?")}
      </Link>
      <h1 className="text-gold-gradient mt-4 font-display text-5xl font-black">{tr('Espace Parent', 'Parent Space')}</h1>
      <p className="mt-2 text-body">{tr('Contrôle parental et suivi des profils enfants.', "Parental controls and children's profiles.")}</p>

      {children?.length === 0 && <p className="mt-10 rounded-3xl bg-surface p-8 text-center text-body ring-1 ring-ivory/10">{tr("Aucun profil enfant pour l'instant.", 'No child profile yet.')}</p>}

      <div className="mt-10 space-y-6">
        {children?.map((c) => {
          const s = stats[c.id];
          return (
            <section key={c.id} className="rounded-[32px] bg-surface p-7 ring-1 ring-ivory/10">
              <div className="flex items-center gap-4">
                <KidAvatar prenom={c.prenom} couleur={c.avatar_couleur} size={64} />
                <div>
                  <p className="text-xl font-bold text-ivory">
                    {c.prenom} <span className="font-normal text-muted">· {ageLabel(c.age, lang)}</span>
                  </p>
                  <p className="text-sm text-body">{tr('Dernière activité :', 'Last activity:')} {s ? (s.derniere ? since(s.derniere, lang) : tr('jamais encore', 'never yet')) : '…'}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-[200px_1fr]">
                <div className="rounded-3xl bg-gold/10 p-5 ring-1 ring-gold/25">
                  <p className="font-display text-3xl font-black text-gold">{s ? (s.aDejaUneSession ? formatMinutes(s.minutes) : tr('Aucune session', 'No session')) : '…'}</p>
                  <p className="text-sm text-body">{tr("aujourd'hui", 'today')}</p>
                </div>
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text">{tr("Limite d'écran quotidienne", 'Daily screen limit')}</p>
                      <p className="text-xs text-muted">{tr("Informative pour l'instant : l'espace enfant ne se verrouille pas automatiquement.", "For information only for now: the kids' space does not lock automatically.")}</p>
                    </div>
                    <div className="flex items-center rounded-full ring-1 ring-ivory/20">
                      <button onClick={() => patch(c, { limite_ecran_minutes: Math.max(0, (c.limite_ecran_minutes ?? 0) - 15) || null })} className="h-10 w-10 text-lg text-ivory">
                        −
                      </button>
                      <span className="min-w-20 text-center text-sm font-bold text-ivory">{c.limite_ecran_minutes ? formatMinutes(c.limite_ecran_minutes) : tr('Aucune', 'None')}</span>
                      <button onClick={() => patch(c, { limite_ecran_minutes: (c.limite_ecran_minutes ?? 0) + 15 })} className="h-10 w-10 text-lg text-ivory">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text">{tr("Carnet d'explorateur (Découverte)", "Explorer's notebook (Discovery)")}</p>
                      <p className="text-xs text-muted">{tr('Villages, coutumes et objets du patrimoine.', 'Heritage villages, customs and objects.')}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={c.decouverte_activee}
                      onClick={() => patch(c, { decouverte_activee: !c.decouverte_activee })}
                      className={`relative h-8 w-14 rounded-full transition ${c.decouverte_activee ? 'bg-gold' : 'bg-ivory/15'}`}
                    >
                      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${c.decouverte_activee ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-5 text-xs text-muted">{tr('Leçons de langue et badges : pas encore disponibles.', 'Language lessons and badges: not available yet.')}</p>
            </section>
          );
        })}
      </div>
      <Link href="/profils/ajouter" className="mt-8 inline-block rounded-full bg-gold px-7 py-3.5 font-extrabold text-ink">
        + {tr('Ajouter un profil enfant', 'Add a child profile')}
      </Link>
    </div>
  );
}
