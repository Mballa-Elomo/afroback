'use server';

import { redirect } from 'next/navigation';
import { createSessionClient } from '@/lib/supabase/server';

export async function login(_prevState: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email et mot de passe requis.' };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Identifiants incorrects.' };
  }

  // La vérification "cet email est bien un admin AFROBACK" (table
  // admin_users) se fait dans lib/auth.ts#requireAdmin(), au chargement de
  // la première page protégée — pas ici, pour ne jamais donner d'indice
  // ("mot de passe correct mais compte non autorisé") à quelqu'un qui
  // n'aurait pas dû avoir de compte Supabase Auth du tout.
  redirect('/');
}
