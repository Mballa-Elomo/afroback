import { createElement, useSyncExternalStore } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { LienVideo } from './lienVideo';
import { pageLecteur } from './pageLecteur';

/** Lecteur YouTube / Vimeo, version navigateur de l'app : le lecteur AFROBACK (pageLecteur.ts) dans un cadre. */
export function LecteurIntegre({ lien, style, titre }: { lien: LienVideo; style?: StyleProp<ViewStyle>; titre?: string }) {
  const origine = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ''
  );
  const html = origine ? pageLecteur(lien, { origine, titre }) : null;
  return (
    <View style={[style, { backgroundColor: '#000', overflow: 'hidden' }]}>
      {html &&
        createElement('iframe', {
          srcDoc: html,
          title: titre || 'Vidéo AFROBACK',
          allow: 'autoplay; encrypted-media; fullscreen; picture-in-picture',
          allowFullScreen: true,
          referrerPolicy: 'strict-origin-when-cross-origin',
          style: { width: '100%', height: '100%', border: 0 },
        })}
    </View>
  );
}
