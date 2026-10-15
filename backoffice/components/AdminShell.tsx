'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { NAV_GROUPS, type NavItem } from '@/lib/navItems';
import type { AdminUser } from '@/lib/auth';
import { rechercheGlobale, type ResultatRecherche } from '@/lib/recherche';
import { Icone } from './Icone';
import { Sankofa } from './Sankofa';
import { Ambiance, annoncerNavigation } from './Ambiance';
import { Suspense } from 'react';
import s from './shell.module.css';

/**
 * Coque du back-office (refonte « Sankofa », 2026-10-10) : menu latéral
 * repliable (mémorisé dans un cookie), tiroir sur petit écran, barre du haut
 * avec fil d'Ariane, palette de commandes Ctrl+K et entrée animée des pages.
 */

const ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

function itemActif(pathname: string) {
  return ITEMS.filter((n) => n.href && (pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href + '/')) || (n.href !== '/' && pathname === n.href))).sort(
    (a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0)
  )[0];
}

function initiales(nom: string) {
  return (
    nom
      .split(/[\s.@_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((m) => m[0]!.toUpperCase())
      .join('') || 'A'
  );
}

export function AdminShell({ admin, replieInitial, badges = {}, children }: { admin: AdminUser; replieInitial: boolean; badges?: Record<string, number>; children: ReactNode }) {
  const pathname = usePathname();
  const [replie, setReplie] = useState(replieInitial);
  const [tiroir, setTiroir] = useState(false);
  const [palette, setPalette] = useState(false);

  const basculer = useCallback(() => {
    setReplie((r) => {
      document.cookie = `afa-sb=${r ? '0' : '1'}; path=/; max-age=31536000; samesite=lax`;
      return !r;
    });
  }, []);

  useEffect(() => setTiroir(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        basculer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [basculer]);

  return (
    <div className={`${s.shell} ${replie ? s.replie : ''} ${tiroir ? s.tiroirOuvert : ''}`}>
      <Suspense fallback={null}>
        <Ambiance />
      </Suspense>
      <Sidebar admin={admin} pathname={pathname} replie={replie} basculer={basculer} ouvrirPalette={() => setPalette(true)} badges={badges} />
      <div className={s.voileTiroir} onClick={() => setTiroir(false)} />
      <div id="afa-scroll-container" className={s.contenu}>
        <Topbar admin={admin} pathname={pathname} ouvrirTiroir={() => setTiroir(true)} ouvrirPalette={() => setPalette(true)} />
        <main className={s.main}>
          <div key={pathname} className="afa-page">
            {children}
          </div>
        </main>
      </div>
      {palette && <Palette fermer={() => setPalette(false)} />}
    </div>
  );
}

// ---------------------------------------------------------------------
// Menu latéral
// ---------------------------------------------------------------------

function Sidebar({
  admin,
  pathname,
  replie,
  basculer,
  ouvrirPalette,
  badges,
}: {
  admin: AdminUser;
  pathname: string;
  replie: boolean;
  basculer: () => void;
  ouvrirPalette: () => void;
  badges: Record<string, number>;
}) {
  const actif = itemActif(pathname);
  const navRef = useRef<HTMLElement>(null);
  const [indic, setIndic] = useState<{ top: number; height: number } | null>(null);
  const groupeActif = NAV_GROUPS.find((g) => g.items.some((n) => n.id === actif?.id))?.group ?? '';

  // Groupes repliables : celui de la page en cours est toujours ouvert, les
  // autres gardent le choix de l'administrateur (mémorisé dans ce navigateur).
  const [ouverts, setOuverts] = useState<Set<string>>(() => new Set([groupeActif]));
  useEffect(() => {
    try {
      const memo = JSON.parse(localStorage.getItem('afa-groupes') ?? 'null') as string[] | null;
      if (memo) setOuverts(new Set([...memo, groupeActif]));
    } catch {
      /* stockage indisponible : on garde l'état par défaut */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    setOuverts((o) => (o.has(groupeActif) ? o : new Set([...o, groupeActif])));
  }, [groupeActif]);

  function basculerGroupe(g: string) {
    setOuverts((o) => {
      const n = new Set(o);
      if (n.has(g)) n.delete(g);
      else n.add(g);
      try {
        localStorage.setItem('afa-groupes', JSON.stringify([...n]));
      } catch {
        /* ignoré */
      }
      return n;
    });
  }

  // Repère doré qui glisse jusqu'à l'entrée active, recalculé pendant
  // l'ouverture et la fermeture des groupes.
  const mesurer = useCallback(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[data-actif="1"]');
    setIndic(el && el.offsetParent ? { top: el.offsetTop, height: el.offsetHeight } : null);
  }, []);
  useLayoutEffect(mesurer, [pathname, replie, ouverts, mesurer]);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(mesurer);
    nav.querySelectorAll('[data-groupe]').forEach((e) => ro.observe(e));
    return () => ro.disconnect();
  }, [mesurer]);

  return (
    <aside className={s.sidebar}>
      <div className={s.kenteBord} />
      <div className={s.marque}>
        <Link href="/" className={s.logo} title="Tableau de bord">
          <span className={s.logoHalo}>
            <Sankofa size={34} epaisseur={7} />
          </span>
          <span className={s.logoTexte}>
            <span className={s.logoNom}>AFROBACK</span>
            <span className={s.logoSous}>Salle de contrôle</span>
          </span>
        </Link>
        <button type="button" className={s.replier} onClick={basculer} title={replie ? 'Déplier le menu (Ctrl+B)' : 'Replier le menu (Ctrl+B)'}>
          <Icone nom={replie ? 'expand' : 'collapse'} taille={16} />
        </button>
      </div>

      <button type="button" className={s.rechercheMenu} onClick={ouvrirPalette} title="Rechercher (Ctrl+K)">
        <Icone nom="search" taille={16} />
        <span className={s.libelle}>Rechercher…</span>
        <kbd className={s.kbd}>Ctrl K</kbd>
      </button>

      <nav ref={navRef} className={s.nav}>
        {indic && <span className={s.indicateur} style={{ transform: `translateY(${indic.top}px)`, height: indic.height }} />}
        {NAV_GROUPS.map((g) => {
          const ouvert = !g.group || replie || ouverts.has(g.group);
          const contientActif = g.group === groupeActif;
          return (
          <div key={g.group || 'racine'} className={s.groupe}>
            {g.group && (
              <button
                type="button"
                className={`${s.groupeTitre} ${contientActif ? s.groupeTitreActif : ''}`}
                onClick={() => basculerGroupe(g.group)}
                aria-expanded={ouvert}
              >
                <span>{g.group}</span>
                <span className={s.groupeCompte}>{g.items.filter((n) => n.enabled).length}</span>
                <span className={`${s.chevron} ${ouvert ? s.chevronOuvert : ''}`}>
                  <Icone nom="expand" taille={13} epaisseur={2.2} />
                </span>
              </button>
            )}
            <div className={`${s.groupeCorps} ${ouvert ? s.groupeCorpsOuvert : ''}`} data-groupe>
            <div className={s.groupeInterieur}>
            {g.items.map((n) => {
              const estActif = actif?.id === n.id;
              if (!n.enabled) {
                return (
                  <div key={n.id} className={`${s.item} ${s.itemInactif}`} title={`${n.label} : bientôt disponible`}>
                    <Icone nom={n.id} />
                    <span className={s.libelle}>{n.label}</span>
                    <span className={s.bientot}>Bientôt</span>
                  </div>
                );
              }
              return (
                <Link
                  key={n.id}
                  href={n.href!}
                  className={`${s.item} ${estActif ? s.itemActif : ''}`}
                  data-actif={estActif && ouvert ? '1' : undefined}
                  title={replie ? n.label : undefined}
                  tabIndex={ouvert ? undefined : -1}
                >
                  <Icone nom={n.id} />
                  <span className={s.libelle}>{n.label}</span>
                  {!!badges[n.id] && (
                    <span className={s.badge} title={`${badges[n.id]} en attente`}>
                      {badges[n.id]}
                    </span>
                  )}
                </Link>
              );
            })}
            </div>
            </div>
          </div>
          );
        })}
      </nav>

      <div className={s.profil}>
        <span className={s.avatar}>{initiales(admin.nom || admin.email)}</span>
        <span className={s.profilTexte}>
          <span className={s.profilNom}>{admin.nom || admin.email}</span>
          <span className={s.profilRole}>
            <span className={s.enLigne} /> Administrateur
          </span>
        </span>
        {/* Formulaire POST et non <Link> : un lien vers /logout serait préchargé par Next.js
            et déconnecterait l'administrateur sans clic (bug corrigé le 2026-10-10). */}
        <form action="/logout" method="post" className={s.deconnexionForm}>
          <button type="submit" className={s.deconnexion} title="Se déconnecter" aria-label="Se déconnecter">
            <Icone nom="logout" taille={17} />
          </button>
        </form>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------
// Barre du haut
// ---------------------------------------------------------------------

function Topbar({ admin, pathname, ouvrirTiroir, ouvrirPalette }: { admin: AdminUser; pathname: string; ouvrirTiroir: () => void; ouvrirPalette: () => void }) {
  const actif = itemActif(pathname);
  const sousPage = actif?.href && actif.href !== '/' && pathname !== actif.href;
  const [heure, setHeure] = useState('');

  useEffect(() => {
    const maj = () => setHeure(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    maj();
    const t = setInterval(maj, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className={s.topbar}>
      <button type="button" className={s.burger} onClick={ouvrirTiroir} aria-label="Ouvrir le menu">
        <Icone nom="menu" />
      </button>
      <div className={s.ariane}>
        <span className={s.arianeIcone}>
          <Icone nom={actif?.id ?? 'dash'} taille={16} />
        </span>
        {sousPage ? (
          <>
            <Link href={actif!.href!} className={s.arianeLien}>
              {actif!.label}
            </Link>
            <span className={s.arianeSep}>/</span>
            <span className={s.arianeCourant}>Fiche</span>
          </>
        ) : (
          <span className={s.arianeCourant}>{actif?.label ?? 'AFROBACK'}</span>
        )}
      </div>

      <button type="button" className={s.declencheur} onClick={ouvrirPalette}>
        <Icone nom="search" taille={16} />
        <span>Rechercher un compte, un héros, une page…</span>
        <kbd className={s.kbd}>Ctrl K</kbd>
      </button>

      <div className={s.topDroite}>
        {heure && (
          <span className={s.horloge}>
            <Icone nom="clock" taille={14} /> {heure}
          </span>
        )}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------
// Palette de commandes (Ctrl+K)
// ---------------------------------------------------------------------

interface Entree {
  cle: string;
  section: string;
  titre: string;
  detail?: string;
  icone: string;
  aller: () => void;
}

const ACTIONS: { titre: string; detail: string; icone: string; href: string; mots: string }[] = [
  { titre: 'Offrir un abonnement', detail: 'Abonnements', icone: 'gift', href: '/paiements?onglet=abonnements', mots: 'offrir cadeau forfait racines heritage abonnement' },
  { titre: 'Transactions Mobile Money', detail: 'Paiements & revenus', icone: 'revenue', href: '/paiements?onglet=transactions', mots: 'paiement transaction campay echec litige revenus argent' },
  { titre: 'Mode maintenance', detail: 'Paramètres · Général', icone: 'settings', href: '/parametres?section=general', mots: 'maintenance fermer site inscriptions' },
  { titre: 'Moyens de paiement', detail: 'Paramètres · Paiements', icone: 'revenue', href: '/parametres?section=paiements', mots: 'paiement mtn orange prix dons' },
  { titre: 'Sécurité et double authentification', detail: 'Paramètres · Sécurité', icone: 'shield', href: '/parametres?section=securite', mots: 'securite 2fa capture appareil' },
  { titre: 'Activer ou couper un module', detail: 'Paramètres · Modules', icone: 'bolt', href: '/parametres?section=modules', mots: 'module communaute marche enfant quiz commentaires' },
  { titre: 'Journal d’activité', detail: 'Paramètres · Journal', icone: 'clock', href: '/parametres?section=journal', mots: 'journal historique log' },
];

const ICONE_TYPE: Record<ResultatRecherche['type'], string> = { utilisateur: 'users', heros: 'heroes', mythe: 'mythology', decouverte: 'discover' };

function sansAccent(t: string) {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function Palette({ fermer }: { fermer: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [distants, setDistants] = useState<ResultatRecherche[]>([]);
  const [chargement, demarrer] = useTransition();
  const [monte, setMonte] = useState(false);
  const listeRef = useRef<HTMLDivElement>(null);
  const deconnexionRef = useRef<HTMLFormElement>(null);

  useEffect(() => setMonte(true), []);

  // Recherche distante (comptes, contenus) après une courte pause de frappe.
  useEffect(() => {
    if (q.trim().length < 2) {
      setDistants([]);
      return;
    }
    const t = setTimeout(() => {
      demarrer(async () => setDistants(await rechercheGlobale(q)));
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const entrees = useMemo<Entree[]>(() => {
    const n = sansAccent(q.trim());
    const aller = (href: string) => () => {
      fermer();
      annoncerNavigation();
      router.push(href);
    };
    const pages = ITEMS.filter((i) => i.enabled && (!n || sansAccent(i.label).includes(n))).map((i) => ({
      cle: `p-${i.id}`,
      section: 'Aller à',
      titre: i.label,
      icone: i.id,
      aller: aller(i.href!),
    }));
    const actions = ACTIONS.filter((a) => !n || sansAccent(`${a.titre} ${a.mots}`).includes(n)).map((a) => ({
      cle: `a-${a.href}`,
      section: 'Actions',
      titre: a.titre,
      detail: a.detail,
      icone: a.icone,
      aller: aller(a.href),
    }));
    if (!n || 'se deconnecter deconnexion logout'.includes(n)) {
      actions.push({ cle: 'a-logout', section: 'Actions', titre: 'Se déconnecter', detail: 'Fermer la session', icone: 'logout', aller: () => deconnexionRef.current?.requestSubmit() });
    }
    const res = distants.map((r) => ({
      cle: `r-${r.href}`,
      section: r.type === 'utilisateur' ? 'Utilisateurs' : 'Contenus',
      titre: r.titre,
      detail: r.detail,
      icone: ICONE_TYPE[r.type],
      aller: aller(r.href),
    }));
    return [...res, ...pages, ...actions];
  }, [q, distants, fermer, router]);

  const courant = Math.min(sel, Math.max(0, entrees.length - 1));

  useEffect(() => {
    listeRef.current?.querySelector<HTMLElement>(`[data-index="${courant}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [courant]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((courant + 1) % Math.max(1, entrees.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((courant - 1 + entrees.length) % Math.max(1, entrees.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      entrees[courant]?.aller();
    } else if (e.key === 'Escape') {
      fermer();
    }
  }

  if (!monte) return null;
  let derniereSection = '';
  return createPortal(
    <div className={s.paletteVoile} onMouseDown={fermer}>
      <div className={s.palette} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Palette de commandes">
        <div className={s.paletteSaisie}>
          <Icone nom="search" taille={18} />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKey}
            placeholder="Chercher un compte, un héros, une page, une action…"
          />
          {chargement && <span className={s.paletteChargement} />}
          <kbd className={s.kbd}>Échap</kbd>
        </div>
        <div className={s.paletteListe} ref={listeRef}>
          {entrees.length === 0 && <div className={s.paletteVide}>{chargement ? 'Recherche…' : 'Aucun résultat.'}</div>}
          {entrees.map((e, i) => {
            const titreSection = e.section !== derniereSection ? e.section : null;
            derniereSection = e.section;
            return (
              <div key={e.cle}>
                {titreSection && <div className={s.paletteSection}>{titreSection}</div>}
                <button
                  type="button"
                  data-index={i}
                  className={`${s.paletteItem} ${i === courant ? s.paletteItemSel : ''}`}
                  onMouseMove={() => setSel(i)}
                  onClick={e.aller}
                >
                  <span className={s.paletteIcone}>
                    <Icone nom={e.icone} taille={16} />
                  </span>
                  <span className={s.paletteTexte}>
                    <span>{e.titre}</span>
                    {e.detail && <span className={s.paletteDetail}>{e.detail}</span>}
                  </span>
                  {i === courant && <Icone nom="arrow" taille={15} style={{ color: 'var(--gold)' }} />}
                </button>
              </div>
            );
          })}
        </div>
        <div className={s.palettePied}>
          <span>
            <kbd className={s.kbd}>↑</kbd> <kbd className={s.kbd}>↓</kbd> naviguer
          </span>
          <span>
            <kbd className={s.kbd}>Entrée</kbd> ouvrir
          </span>
          <span className={s.palettePiedMarque}>
            <Sankofa size={14} epaisseur={9} /> AFROBACK
          </span>
        </div>
        <form ref={deconnexionRef} action="/logout" method="post" hidden />
      </div>
    </div>,
    document.body
  );
}
