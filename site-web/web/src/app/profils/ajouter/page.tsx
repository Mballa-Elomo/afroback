'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, Notice, Submit } from '@/components/auth-ui';
import { KidAvatar } from '@/components/kids';
import { useMember } from '@/lib/auth';
import { AVATAR_COULEURS, AVATAR_GRADIENTS, AVATAR_LABEL, LANGUES, createChild, type AvatarCouleur, type Langue } from '@/lib/kids';
import { useLang } from '@/lib/lang-client';

/**
 * Ajout d'un profil enfant, comme dans l'app (app/profils/ajouter.tsx) :
 * gratuit, sans étape de paiement (décision du 2026-07-31). Les langues
 * choisies sont enregistrées, mais aucune leçon de langue n'existe encore.
 */
export default function AjouterEnfant() {
  const { ready, session } = useMember();
  const { tr, lang } = useLang();
  const router = useRouter();
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState('');
  const [couleur, setCouleur] = useState<AvatarCouleur>('terracotta');
  const [langues, setLangues] = useState<Langue[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/profils/ajouter');
  }, [ready, session, router]);

  const n = Number(age);
  const valid = prenom.trim().length > 0 && age.trim() !== '' && Number.isInteger(n) && n >= 0 && n <= 17;

  return (
    <div className="mx-auto max-w-xl px-5 pb-16 pt-32">
      <Link href="/profils" className="text-sm font-semibold text-gold">
        ‹ {tr('Qui regarde ?', "Who's watching?")}
      </Link>
      <h1 className="text-gold-gradient mt-4 font-display text-4xl font-black md:text-5xl">{tr('Ajouter un enfant', 'Add a child')}</h1>
      <p className="mt-3 text-body">{tr("Un espace rien qu'à lui : l'École des Héros, une histoire chaque jour et le carnet d'explorateur.", "A space all their own: the School of Heroes, a story every day and the explorer's notebook.")}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!valid) return setError(tr('Indique un prénom et un âge entre 0 et 17 ans.', 'Enter a first name and an age between 0 and 17.'));
          setBusy(true);
          setError(null);
          const r = await createChild({ prenom, age: n, avatar_couleur: couleur, langues_actives: langues });
          setBusy(false);
          if (r.error) return setError(r.error);
          router.push('/profils');
        }}
        className="mt-8 space-y-6"
      >
        <div className="flex justify-center">
          <KidAvatar prenom={prenom || '?'} couleur={couleur} size={110} />
        </div>
        <Field label={tr('Prénom', 'First name')} value={prenom} onChange={setPrenom} placeholder="Léa" />
        <Field label={tr('Âge', 'Age')} value={age} onChange={(v) => setAge(v.replace(/\D/g, '').slice(0, 2))} placeholder="8" />
        <div>
          <p className="text-sm font-semibold text-text">{tr("Couleur de l'avatar", 'Avatar colour')}</p>
          <div className="mt-3 flex gap-3">
            {AVATAR_COULEURS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCouleur(c)}
                aria-label={AVATAR_LABEL[c]}
                style={{ background: `linear-gradient(145deg, ${AVATAR_GRADIENTS[c][0]}, ${AVATAR_GRADIENTS[c][1]})` }}
                className={`h-14 w-14 rounded-2xl transition ${couleur === c ? 'scale-110 ring-4 ring-gold' : 'opacity-70 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-text">{tr('Langues à activer', 'Languages to enable')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGUES.map((l) => {
              const on = langues.includes(l.id);
              return (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setLangues((p) => (on ? p.filter((x) => x !== l.id) : [...p, l.id]))}
                  className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${on ? 'bg-gold text-ink ring-gold' : 'text-body ring-ivory/20 hover:ring-gold/50'}`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">{tr('Les leçons de langue arrivent bientôt.', 'Language lessons are coming soon.')}</p>
        </div>
        {error && <Notice>{error}</Notice>}
        <Submit busy={busy} disabled={!valid}>
          {tr('Ajouter ce profil', 'Add this profile')}
        </Submit>
      </form>
    </div>
  );
}
