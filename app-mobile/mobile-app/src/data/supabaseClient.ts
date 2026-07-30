import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY manquants — voir .env à la racine du projet.'
  );
}

/**
 * Client public (clé "anon"/"publishable"). Les données héros restent en
 * lecture seule (RLS n'autorise que select côté anon, voir
 * heroesRepository.ts). L'authentification (comptes utilisateurs) passe en
 * revanche bien par ce client : Supabase Auth gère sa propre table
 * `auth.users`, distincte de la table `heros`. Session persistée via
 * AsyncStorage pour que l'utilisateur reste connecté d'un lancement à
 * l'autre de l'app.
 */
export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
