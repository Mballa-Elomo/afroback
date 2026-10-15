import { getSupabaseAdmin } from './supabase/server';

/**
 * Module Quiz (cdc-module-quiz.md) : les trois familles de questions sont
 * ramenées à une forme commune pour un seul éditeur.
 * - `contenu` : quiz_questions (fin d'un héros ou d'un mythe) ;
 * - `lecon`   : ecole_quiz_questions (fin d'une leçon de l'École des Héros) ;
 * - `niveau`  : ecole_quiz_niveau (quiz récapitulatif d'un niveau).
 */

export type Famille = 'contenu' | 'lecon' | 'niveau';

export interface Question {
  id: string;
  famille: Famille;
  groupe: string; // « heros:slug », « mythe:slug », id de leçon, ou numéro de niveau
  ordre: number;
  question_fr: string;
  question_en: string;
  choix_fr: string[];
  choix_en: string[];
  bonne: number;
  explication_fr: string;
  explication_en: string;
  // Statistiques (fin de contenu seulement)
  repondu: number;
  juste: number;
}

export interface GroupeQuiz {
  cle: string;
  famille: Famille;
  titre: string;
  sousTitre: string;
  publie: boolean;
  niveau?: number;
  tentatives: number;
  scoreMoyen: number | null;
  maitrise: number | null;
}

export interface DonneesQuiz {
  questions: Question[];
  groupes: GroupeQuiz[];
  erreur: string | null;
}

const tableau = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x ?? '')) : []);

export async function chargerQuiz(): Promise<DonneesQuiz> {
  const supabase = getSupabaseAdmin();
  const [qq, he, my, te, le, eq, en] = await Promise.all([
    supabase.from('quiz_questions').select('*').order('ordre'),
    supabase.from('heros').select('id, slug, nom_affiche, statut_publication').order('ordre_affichage'),
    supabase.from('mythes').select('slug, titre, statut_publication').order('ordre_affichage'),
    supabase.from('quiz_tentatives').select('type_contenu, slug, score, total, reponses').limit(20000),
    supabase.from('ecole_lecons').select('id, heros_id, niveau'),
    supabase.from('ecole_quiz_questions').select('*').order('ordre'),
    supabase.from('ecole_quiz_niveau').select('*').order('ordre'),
  ]);
  if (qq.error) return { questions: [], groupes: [], erreur: qq.error.message };

  // Réponses enregistrées : taux de bonnes réponses par question.
  const stats = new Map<string, { repondu: number; choix: number[] }>();
  const tentatives = (te.data ?? []) as { type_contenu: string; slug: string; score: number; total: number; reponses: unknown }[];
  for (const t of tentatives) {
    for (const r of Array.isArray(t.reponses) ? (t.reponses as { question_id?: string; choix?: number }[]) : []) {
      if (!r?.question_id) continue;
      const s = stats.get(r.question_id) ?? { repondu: 0, choix: [] };
      s.repondu++;
      s.choix.push(Number(r.choix));
      stats.set(r.question_id, s);
    }
  }

  const questions: Question[] = [];
  for (const q of (qq.data ?? []) as Record<string, unknown>[]) {
    const s = stats.get(String(q.id));
    const bonne = Number(q.bonne_reponse);
    questions.push({
      id: String(q.id),
      famille: 'contenu',
      groupe: `${q.type_contenu}:${q.slug}`,
      ordre: Number(q.ordre),
      question_fr: String(q.question_fr ?? ''),
      question_en: String(q.question_en ?? ''),
      choix_fr: tableau(q.choix_fr),
      choix_en: tableau(q.choix_en),
      bonne,
      explication_fr: String(q.explication_fr ?? ''),
      explication_en: String(q.explication_en ?? ''),
      repondu: s?.repondu ?? 0,
      juste: s ? s.choix.filter((c) => c === bonne).length : 0,
    });
  }
  const ecole = (rows: Record<string, unknown>[] | null, famille: 'lecon' | 'niveau') =>
    (rows ?? []).map((q) => ({
      id: String(q.id),
      famille,
      groupe: famille === 'lecon' ? String(q.lecon_id) : String(q.niveau),
      ordre: Number(q.ordre ?? 0),
      question_fr: String(q.question ?? ''),
      question_en: String(q.question_en ?? ''),
      choix_fr: tableau(q.choix),
      choix_en: tableau(q.choix_en),
      bonne: Number(q.reponse_correcte_index),
      explication_fr: String(q.explication ?? ''),
      explication_en: String(q.explication_en ?? ''),
      repondu: 0,
      juste: 0,
    }));
  questions.push(...ecole(eq.data as Record<string, unknown>[] | null, 'lecon'), ...ecole(en.data as Record<string, unknown>[] | null, 'niveau'));

  // Groupes : tous les héros et mythes (même sans quiz), leçons et niveaux de l'École.
  const statsContenu = (type: string, slug: string) => {
    const l = tentatives.filter((t) => t.type_contenu === type && t.slug === slug && t.total > 0);
    if (!l.length) return { tentatives: 0, scoreMoyen: null, maitrise: null };
    return {
      tentatives: l.length,
      scoreMoyen: Math.round((l.reduce((n, t) => n + t.score / t.total, 0) / l.length) * 100),
      maitrise: Math.round((l.filter((t) => t.score / t.total >= 0.8).length / l.length) * 100),
    };
  };
  const heros = (he.data ?? []) as { id: string; slug: string; nom_affiche: string; statut_publication: string | null }[];
  const nomHeros = new Map(heros.map((h) => [h.id, h.nom_affiche]));
  const groupes: GroupeQuiz[] = [
    ...heros.map((h) => ({
      cle: `heros:${h.slug}`,
      famille: 'contenu' as const,
      titre: h.nom_affiche,
      sousTitre: 'Héros',
      publie: (h.statut_publication ?? 'publie') !== 'depublie',
      ...statsContenu('heros', h.slug),
    })),
    ...((my.data ?? []) as { slug: string; titre: string; statut_publication: string | null }[]).map((m) => ({
      cle: `mythe:${m.slug}`,
      famille: 'contenu' as const,
      titre: m.titre,
      sousTitre: 'Mythe',
      publie: (m.statut_publication ?? 'publie') !== 'depublie',
      ...statsContenu('mythe', m.slug),
    })),
    ...((le.data ?? []) as { id: string; heros_id: string; niveau: number }[])
      .sort((a, b) => a.niveau - b.niveau || (nomHeros.get(a.heros_id) ?? '').localeCompare(nomHeros.get(b.heros_id) ?? ''))
      .map((l) => ({
        cle: l.id,
        famille: 'lecon' as const,
        titre: nomHeros.get(l.heros_id) ?? 'Leçon',
        sousTitre: `Leçon · niveau ${l.niveau}`,
        publie: true,
        niveau: l.niveau,
        tentatives: 0,
        scoreMoyen: null,
        maitrise: null,
      })),
    ...[1, 2, 3, 4].map((n) => ({
      cle: String(n),
      famille: 'niveau' as const,
      titre: `Quiz du niveau ${n}`,
      sousTitre: ['3-5 ans', '6-8 ans', '9-11 ans', '12 ans et plus'][n - 1],
      publie: true,
      niveau: n,
      tentatives: 0,
      scoreMoyen: null,
      maitrise: null,
    })),
  ];

  return { questions, groupes, erreur: null };
}
