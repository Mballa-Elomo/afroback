/** Icônes au trait du back-office (24 × 24, trait 1.8, couleur héritée). */
const TRACES: Record<string, string[]> = {
  dash: ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
  heroes: ['M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z'],
  discover: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M15.8 8.2l-2 5.6-5.6 2 2-5.6z'],
  mythology: ['M20.5 13.4A8.5 8.5 0 1 1 10.6 3.5a6.6 6.6 0 0 0 9.9 9.9z'],
  ecole: ['M22 9.5L12 4.5 2 9.5l10 5z', 'M6 11.6v4.9c3.4 2.5 8.6 2.5 12 0v-4.9', 'M22 9.5v5.5'],
  media: ['M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z', 'M8.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M21 15.5l-5-5L5 20'],
  translation: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M3 12h18', 'M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z'],
  community: ['M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-6A3.5 3.5 0 0 0 3 18.5V20', 'M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M21 20v-1.5a3.5 3.5 0 0 0-2.6-3.4', 'M15.5 4.2a3.5 3.5 0 0 1 0 6.6'],
  comments: ['M20 14.5a2 2 0 0 1-2 2H8l-4 4V5.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z', 'M8 8.5h8', 'M8 12h5'],
  market: ['M6 3L3.5 6.5V19a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V6.5L18 3z', 'M3.5 6.5h17', 'M15.5 10a3.5 3.5 0 0 1-7 0'],
  dons: ['M12 20.5s-8-4.6-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.1c0 5.8-8 10.4-8 10.4z'],
  revenue: ['M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'M2 10.5h20', 'M6 14.5h4'],
  sponsors: ['M12 14.5a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M8.5 13.5L7 21.5l5-2.8 5 2.8-1.5-8'],
  users: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4.5 20.5v-.8A5.7 5.7 0 0 1 10.2 14h3.6a5.7 5.7 0 0 1 5.7 5.7v.8'],
  settings: ['M4 21v-6', 'M4 11V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-4', 'M20 13V3', 'M1.5 15h5', 'M9.5 8h5', 'M17.5 17h5'],
  logout: ['M9 20.5H5.5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H9', 'M16 16.5l4.5-4.5L16 7.5', 'M20.5 12H9'],
  search: ['M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z', 'M21 21l-5.2-5.2'],
  menu: ['M3 6.5h18', 'M3 12h18', 'M3 17.5h18'],
  collapse: ['M15 6l-6 6 6 6'],
  expand: ['M9 6l6 6-6 6'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'],
  bolt: ['M13 2.5L4 13.5h7l-1 8 9-11h-7z'],
  shield: ['M12 21.5s7.5-3.5 7.5-9.5V5.5L12 2.5l-7.5 3V12c0 6 7.5 9.5 7.5 9.5z'],
  gift: ['M3.5 8h17v4h-17z', 'M5 12v8.5h14V12', 'M12 8v12.5', 'M12 8S10.5 3.5 8 3.5a2.2 2.2 0 0 0 0 4.5h4', 'M12 8s1.5-4.5 4-4.5a2.2 2.2 0 0 1 0 4.5h-4'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  eyeOff: ['M3 3l18 18', 'M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3 3.8', 'M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2'],
  mail: ['M3 5.5h18v13H3z', 'M3 6.5l9 6.5 9-6.5'],
  lock: ['M5.5 11h13v10h-13z', 'M8 11V7.5a4 4 0 0 1 8 0V11'],
  trash: ['M3.5 6.5h17', 'M8.5 6.5V4h7v2.5', 'M6 6.5l1 14h10l1-14', 'M10 10.5v6', 'M14 10.5v6'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
};

export function Icone({ nom, taille = 18, epaisseur = 1.8, style }: { nom: string; taille?: number; epaisseur?: number; style?: React.CSSProperties }) {
  const traces = TRACES[nom] ?? TRACES.dash;
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: 'none', ...style }}
      aria-hidden
    >
      {traces.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
