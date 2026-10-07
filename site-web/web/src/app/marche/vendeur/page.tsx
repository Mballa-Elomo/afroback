'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { Field, Notice, Submit } from '@/components/auth-ui';
import { useMember } from '@/lib/auth';
import { uploadImage } from '@/lib/upload';
import {
  CATEGORIES,
  catLabel,
  createVendor,
  fcfa,
  markShipped,
  myVendor,
  replyReview,
  saveProduct,
  statutLabel,
  vendorOrders,
  vendorProducts,
  vendorReviews,
  type Categorie,
  type Order,
  type Product,
  type Review,
  type Vendor,
} from '@/lib/market';
import { useLang } from '@/lib/lang-client';

/** Espace vendeur : ouvrir sa boutique, gérer ses articles, ses commandes et ses avis. */
export default function Vendeur() {
  const { ready, session, member } = useMember();
  const { tr, lang, locale } = useLang();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null | undefined>(undefined);

  useEffect(() => {
    if (ready && !session) router.replace('/connexion?suite=/marche/vendeur');
    if (member) myVendor().then(setVendor);
  }, [ready, session, member, router]);

  if (!member || vendor === undefined) return <p className="px-5 pt-40 text-center text-muted">{tr('Chargement…', 'Loading…')}</p>;
  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-32 md:px-10">
      <Link href="/marche" className="text-sm font-semibold text-gold">
        ‹ {tr('Le Marché', 'The Market')}
      </Link>
      {vendor ? <Dashboard vendor={vendor} /> : <OpenShop onCreated={setVendor} />}
    </div>
  );
}

function ImagePick({ url, onUrl, folder }: { url: string | null; onUrl: (u: string) => void; folder: 'products' | 'avatars-marche' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tr } = useLang();
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-4">
        <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-ink ring-1 ring-ivory/15">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl text-muted">+</span>
          )}
        </div>
        <span className="text-sm font-semibold text-gold">{busy ? tr('Envoi…', 'Uploading…') : url ? tr('Changer la photo', 'Change photo') : tr('Ajouter une photo', 'Add a photo')}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            setError(null);
            const r = await uploadImage(f, folder);
            setBusy(false);
            if (r.error) setError(r.error);
            else if (r.url) onUrl(r.url);
          }}
        />
      </label>
      {error && <p className="mt-2 text-sm text-terra">{error}</p>}
    </div>
  );
}

function OpenShop({ onCreated }: { onCreated: (v: Vendor) => void }) {
  const [nom, setNom] = useState('');
  const { tr, lang, locale } = useLang();
  const [region, setRegion] = useState('');
  const [artisanat, setArtisanat] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!nom || !region || !artisanat) return setError(tr('Nom de la boutique, région et artisanat sont obligatoires.', 'Shop name, region and craft are required.'));
        setBusy(true);
        const r = await createVendor({ nom_boutique: nom.trim(), region: region.trim(), artisanat: artisanat.trim(), bio: bio.trim(), avatar_url: avatar });
        setBusy(false);
        if (r.error || !r.vendor) return setError(r.error ?? tr('Création impossible.', 'Could not create the shop.'));
        onCreated(r.vendor);
      }}
      className="mx-auto mt-6 max-w-xl space-y-5"
    >
      <h1 className="text-gold-gradient font-display text-5xl font-black">{tr('Ouvre ta boutique', 'Open your shop')}</h1>
      <p className="text-body">{tr('Présente tes créations à toute la communauté AFROBACK. Les acheteurs te contactent pour le paiement et la livraison.', 'Show your creations to the whole AFROBACK community. Buyers contact you for payment and delivery.')}</p>
      <ImagePick url={avatar} onUrl={setAvatar} folder="avatars-marche" />
      <Field label={tr('Nom de la boutique', 'Shop name')} value={nom} onChange={setNom} />
      <Field label={tr('Région', 'Region')} value={region} onChange={setRegion} placeholder={tr('Ex. Ouest Cameroun', 'E.g. West Cameroon')} />
      <Field label={tr('Artisanat', 'Craft')} value={artisanat} onChange={setArtisanat} placeholder={tr('Ex. Sculpture sur bois', 'E.g. Wood carving')} />
      <label className="block">
        <span className="text-sm font-semibold text-text">{tr('Présentation (facultatif)', 'About (optional)')}</span>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl bg-surface px-4 py-3 text-ivory ring-1 ring-ivory/10 focus:outline-none focus:ring-gold/40" />
      </label>
      {error && <Notice>{error}</Notice>}
      <Submit busy={busy}>{tr('Ouvrir ma boutique', 'Open my shop')}</Submit>
    </form>
  );
}

type Draft = { id?: string; nom: string; description: string; categorie: Categorie; prix: string; stock: string; image_url: string | null };
const EMPTY: Draft = { nom: '', description: '', categorie: 'sculpture', prix: '', stock: '1', image_url: null };

function Dashboard({ vendor }: { vendor: Vendor }) {
  const [tab, setTab] = useState<'articles' | 'commandes' | 'avis'>('articles');
  const { tr, lang, locale } = useLang();
  const [items, setItems] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [revs, setRevs] = useState<Review[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = useCallback(async () => {
    const p = await vendorProducts(vendor.id);
    setItems(p);
    setOrders(await vendorOrders(vendor.id));
    setRevs(await vendorReviews(p.map((x) => x.id)));
  }, [vendor.id]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <Avatar url={vendor.avatar_url} name={vendor.nom_boutique} size={72} />
        <div>
          <h1 className="font-display text-4xl font-black text-ivory">{vendor.nom_boutique}</h1>
          <p className="text-body">
            {vendor.artisanat} · {vendor.region}
          </p>
        </div>
        <Link href={`/marche/artisan/${vendor.id}`} className="ml-auto text-sm font-semibold text-gold hover:underline">
          {tr('Voir ma vitrine →', 'View my shop →')}
        </Link>
      </div>

      <div className="mt-8 flex gap-2 border-b border-ivory/10">
        {(
          [
            ['articles', `${tr('Articles', 'Items')} · ${items.length}`],
            ['commandes', `${tr('Commandes', 'Orders')} · ${orders.length}`],
            ['avis', `${tr('Avis', 'Reviews')} · ${revs.length}`],
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`-mb-px border-b-2 px-4 py-3 text-sm font-bold ${tab === id ? 'border-gold text-gold' : 'border-transparent text-body hover:text-ivory'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'articles' && (
        <div className="mt-8">
          {draft ? (
            <ProductForm vendorId={vendor.id} draft={draft} onCancel={() => setDraft(null)} onSaved={() => (setDraft(null), load())} />
          ) : (
            <button onClick={() => setDraft(EMPTY)} className="rounded-full bg-gold px-6 py-3 font-extrabold text-ink">
              + {tr('Ajouter un article', 'Add an item')}
            </button>
          )}
          {items.length === 0 && !draft && <p className="mt-6 text-body">{tr('Ta boutique est vide. Ajoute ta première création.', 'Your shop is empty. Add your first creation.')}</p>}
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {items.map((p) => (
              <li key={p.id} className="flex items-center gap-4 rounded-3xl bg-surface p-4 ring-1 ring-ivory/10">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-ink">
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-bold text-ivory">{p.nom}</p>
                  <p className="text-sm text-body">
                    {catLabel(p.categorie, lang)} · {fcfa(p.prix_fcfa)} · {tr('stock', 'stock')} {p.stock}
                  </p>
                </div>
                <button
                  onClick={() => setDraft({ id: p.id, nom: p.nom, description: p.description ?? '', categorie: p.categorie, prix: String(p.prix_fcfa), stock: String(p.stock), image_url: p.image_url })}
                  className="text-sm font-semibold text-gold"
                >
                  {tr('Modifier', 'Edit')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'commandes' && (
        <ul className="mt-8 space-y-4">
          {orders.length === 0 && <p className="text-body">{tr('Aucune commande pour le moment.', 'No orders yet.')}</p>}
          {orders.map((o) => (
            <li key={o.id} className="rounded-3xl bg-surface p-6 ring-1 ring-ivory/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">{new Date(o.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">{statutLabel(o.statut, lang)}</span>
              </div>
              <ul className="mt-3 space-y-1 text-body">
                {o.items.map((it) => (
                  <li key={it.product_id}>
                    {it.quantite} × {it.nom}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-text">
                {tr('Livraison :', 'Delivery:')} {o.livraison_nom_complet}, {o.livraison_adresse}, {o.livraison_ville} · <b>{o.livraison_telephone}</b>
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-2xl font-black text-gold">{fcfa(o.montant_total_fcfa)}</p>
                {o.statut !== 'expediee' && o.statut !== 'livree' && o.statut !== 'annulee' && (
                  <button onClick={async () => (await markShipped(o.id), load())} className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-ink">
                    {tr('Marquer comme expédiée', 'Mark as shipped')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'avis' && (
        <ul className="mt-8 space-y-4">
          {revs.length === 0 && <p className="text-body">{tr("Pas encore d'avis sur tes articles.", 'No reviews on your items yet.')}</p>}
          {revs.map((r) => (
            <ReviewReply key={r.id} r={r} product={items.find((p) => p.id === r.product_id)?.nom ?? ''} onDone={load} />
          ))}
        </ul>
      )}
    </>
  );
}

function ProductForm({ vendorId, draft, onCancel, onSaved }: { vendorId: string; draft: Draft; onCancel: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(draft);
  const { tr, lang, locale } = useLang();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof Draft) => (v: string) => setD((x) => ({ ...x, [k]: v }));
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const prix = parseInt(d.prix, 10);
        const stock = parseInt(d.stock, 10);
        if (!d.nom.trim() || !(prix > 0) || !(stock >= 0)) return setError(tr('Nom, prix (> 0) et stock sont obligatoires.', 'Name, price (> 0) and stock are required.'));
        setBusy(true);
        const r = await saveProduct(vendorId, { id: d.id, nom: d.nom.trim(), description: d.description.trim(), categorie: d.categorie, prix_fcfa: prix, stock, image_url: d.image_url });
        setBusy(false);
        if (r.error) return setError(r.error);
        onSaved();
      }}
      className="max-w-2xl space-y-5 rounded-[32px] bg-surface p-7 ring-1 ring-ivory/10"
    >
      <p className="font-display text-2xl font-bold text-ivory">{d.id ? tr('Modifier l’article', 'Edit item') : tr('Nouvel article', 'New item')}</p>
      <ImagePick url={d.image_url} onUrl={(u) => setD((x) => ({ ...x, image_url: u }))} folder="products" />
      <Field label={tr('Nom', 'Name')} value={d.nom} onChange={set('nom')} />
      <label className="block">
        <span className="text-sm font-semibold text-text">{tr('Catégorie', 'Category')}</span>
        <select value={d.categorie} onChange={(e) => set('categorie')(e.target.value)} className="mt-2 w-full rounded-2xl bg-ink px-4 py-3 text-ivory ring-1 ring-ivory/10">
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {tr(c.label, c.en)}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <Field label={tr('Prix (FCFA)', 'Price (FCFA)')} type="number" value={d.prix} onChange={set('prix')} />
        <Field label="Stock" type="number" value={d.stock} onChange={set('stock')} />
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-text">Description</span>
        <textarea value={d.description} onChange={(e) => set('description')(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl bg-ink px-4 py-3 text-ivory ring-1 ring-ivory/10 focus:outline-none focus:ring-gold/40" />
      </label>
      {error && <Notice>{error}</Notice>}
      <div className="flex gap-3">
        <Submit busy={busy}>{tr('Enregistrer', 'Save')}</Submit>
        <button type="button" onClick={onCancel} className="rounded-full px-6 text-body hover:text-ivory">
          {tr('Annuler', 'Cancel')}
        </button>
      </div>
    </form>
  );
}

function ReviewReply({ r, product, onDone }: { r: Review; product: string; onDone: () => void }) {
  const [txt, setTxt] = useState(r.reponse_vendeur ?? '');
  const { tr, lang, locale } = useLang();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <li className="rounded-3xl bg-surface p-5 ring-1 ring-ivory/10">
      <p className="text-xs text-muted">{product}</p>
      <p className="text-gold">
        {'★'.repeat(r.note)}
        <span className="text-muted">{'★'.repeat(5 - r.note)}</span>
      </p>
      <p className="mt-2 text-text">{r.commentaire}</p>
      <p className="mt-1 text-xs text-muted">{r.auteur_nom}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await replyReview(r.id, txt.trim());
          setMsg(res.error ?? tr('Réponse publiée.', 'Reply posted.'));
          if (!res.error) onDone();
        }}
        className="mt-3 flex gap-2"
      >
        <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={tr('Répondre à cet avis…', 'Reply to this review…')} className="flex-1 rounded-full bg-ink px-4 py-2 text-sm text-ivory ring-1 ring-ivory/10 focus:outline-none focus:ring-gold/40" />
        <button className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-ink">{tr('Répondre', 'Reply')}</button>
      </form>
      {msg && <p className="mt-2 text-sm text-body">{msg}</p>}
    </li>
  );
}
