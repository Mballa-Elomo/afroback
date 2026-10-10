import { getSupabaseAdmin } from '@/lib/supabase/server';
import { fusionner, type Section } from '@/lib/parametres';
import { ParametresModule, type EvenementSecurite, type LigneJournal } from './ParametresModule';
import styles from './parametres.module.css';

export const dynamic = 'force-dynamic';

/**
 * Module Paramètres (cdc-module-parametres.md) : lecture côté serveur (clé
 * service_role), édition dans le composant client. Si le script SQL n'est
 * pas encore exécuté, la page l'indique au lieu de planter.
 */
const SECTIONS_URL = new Set(['apercu', 'general', 'modules', 'paiements', 'securite', 'journal']);

export default async function ParametresPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { section } = await searchParams;
  const supabase = getSupabaseAdmin();
  const [settingsRes, logRes, eventsRes] = await Promise.all([
    supabase.from('app_settings').select('data, updated_at, updated_by').eq('id', 1).maybeSingle(),
    supabase.from('admin_activity_log').select('id, admin_email, action, created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('security_events').select('id, event_type, detail, created_at').order('created_at', { ascending: false }).limit(100),
  ]);

  if (settingsRes.error) {
    return (
      <div className={styles.installCard}>
        <h1 className={styles.pageTitle}>Paramètres</h1>
        <p>
          Le module n&apos;est pas encore installé en base. Exécutez <code>schema-parametres.sql</code> puis{' '}
          <code>schema-parametres-v2.sql</code> (dossier <code>app-mobile/mobile-app/supabase/</code>) dans le SQL Editor
          de Supabase, puis rechargez cette page.
        </p>
      </div>
    );
  }

  return (
    <ParametresModule
      initial={fusionner(settingsRes.data?.data)}
      majInitiale={settingsRes.data?.updated_at ?? null}
      auteurInitial={settingsRes.data?.updated_by ?? null}
      journal={(logRes.data ?? []) as LigneJournal[]}
      evenements={(eventsRes.data ?? []) as EvenementSecurite[]}
      sectionInitiale={(SECTIONS_URL.has(section ?? '') ? section : 'apercu') as Section | 'apercu' | 'journal'}
    />
  );
}
