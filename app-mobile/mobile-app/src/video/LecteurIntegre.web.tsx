import { createElement } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { urlIntegration, type LienVideo } from './lienVideo';

/** Lecteur YouTube / Vimeo intégré, version navigateur de l'app (cadre classique). */
export function LecteurIntegre({ lien, style }: { lien: LienVideo; style?: StyleProp<ViewStyle> }) {
  const src = urlIntegration(lien);
  if (!src) return null;
  return (
    <View style={[style, { backgroundColor: '#000', overflow: 'hidden' }]}>
      {createElement('iframe', {
        src,
        title: 'Vidéo AFROBACK',
        allow: 'autoplay; encrypted-media; fullscreen; picture-in-picture',
        allowFullScreen: true,
        referrerPolicy: 'strict-origin-when-cross-origin',
        style: { width: '100%', height: '100%', border: 0 },
      })}
    </View>
  );
}
