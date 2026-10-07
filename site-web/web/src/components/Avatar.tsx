/** Photo de profil, ou initiale sur fond doré. */
export function Avatar({ url, name, size = 40 }: { url?: string | null; name?: string | null; size?: number }) {
  const initial = (name ?? '?').trim()[0]?.toUpperCase() ?? '?';
  const isPhoto = !!url && /^https?:\/\//.test(url);
  return isPhoto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url as string} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover ring-2 ring-gold" />
  ) : (
    <span
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-pale to-gold-deep font-display font-black text-ink ring-2 ring-gold"
    >
      {initial}
    </span>
  );
}
