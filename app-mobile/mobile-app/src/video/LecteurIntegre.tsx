import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { urlIntegration, type LienVideo } from './lienVideo';

/**
 * Lecteur YouTube / Vimeo intégré (téléphone). La vidéo est chargée dans une
 * page minimale dont l'origine est le site AFROBACK : YouTube refuse de lire
 * une vidéo intégrée sans origine identifiable. Toute tentative de quitter
 * le lecteur (logo YouTube, vidéos suggérées) est bloquée : on reste dans
 * l'app. Version navigateur : LecteurIntegre.web.tsx.
 */
const ORIGINE = 'https://afroback-web.vercel.app/';

function page(src: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe src="${src}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></body></html>`;
}

export function LecteurIntegre({ lien, style }: { lien: LienVideo; style?: StyleProp<ViewStyle> }) {
  const [charge, setCharge] = useState(false);
  const src = urlIntegration(lien);
  if (!src) return null;
  return (
    <View style={[style, styles.cadre]}>
      <WebView
        source={{ html: page(src), baseUrl: ORIGINE }}
        style={styles.web}
        originWhitelist={['*']}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        setSupportMultipleWindows={false}
        onLoadEnd={() => setCharge(true)}
        onShouldStartLoadWithRequest={(r) => r.isTopFrame === false || r.url.startsWith(ORIGINE) || r.url.startsWith('about:')}
      />
      {!charge && (
        <View style={styles.attente} pointerEvents="none">
          <ActivityIndicator color="#F0C36B" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { backgroundColor: '#000', overflow: 'hidden' },
  web: { flex: 1, backgroundColor: '#000' },
  attente: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
