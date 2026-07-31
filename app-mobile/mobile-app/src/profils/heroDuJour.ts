import type { Heros } from '../data/types';

/**
 * Choisit un vrai héros du catalogue existant pour la carte "Histoire du
 * jour" de l'accueil enfant — jamais un héros inventé (la maquette montrait
 * "Mansa Moussa", qui ne fait pas partie des 9 héros réels du catalogue).
 * Choix déterministe par jour de l'année : stable pendant 24h, tourne
 * ensuite, sans tirage aléatoire ni état à persister.
 */
export function pickHeroDuJour(heroes: Heros[]): Heros | undefined {
  if (heroes.length === 0) return undefined;
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  return heroes[dayOfYear % heroes.length];
}
