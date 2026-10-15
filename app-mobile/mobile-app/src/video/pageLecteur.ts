import { miniature, type LienVideo } from './lienVideo';

/**
 * Lecteur AFROBACK pour les vidéos YouTube / Vimeo (2026-10-11).
 *
 * But : l'abonné ne touche jamais l'interface de YouTube ou de Vimeo (logo,
 * bouton « Partager », clic droit « Copier l'URL de la vidéo »), donc il ne
 * peut pas récupérer le lien sans compétence technique. Le lecteur d'origine
 * tourne dessous sans recevoir aucun clic (pointer-events: none) ; nos
 * boutons le pilotent par messages (API d'intégration YouTube et Vimeo,
 * sans charger aucun script externe).
 *
 * Page autonome : servie en `srcdoc` sur le site, en `html` dans la WebView
 * de l'app. Elle prévient la page qui l'héberge (« lecture », « fin »).
 * Copie identique dans l'app (src/video/pageLecteur.ts) et le site
 * (src/lib/pageLecteur.ts) : garder les deux fichiers alignés.
 */

function echapper(t: string) {
  return t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function urlPilotee(l: LienVideo, origine: string, autoplay: boolean): string | null {
  if (l.type === 'youtube') {
    const p = new URLSearchParams({
      controls: '0',
      disablekb: '1',
      fs: '0',
      rel: '0',
      modestbranding: '1',
      iv_load_policy: '3',
      playsinline: '1',
      enablejsapi: '1',
      origin: origine,
      widget_referrer: origine,
      // Demande de HD (non officiel, ignoré sans risque si YouTube ne l'applique pas).
      vq: 'hd1080',
    });
    if (l.debut) p.set('start', String(l.debut));
    if (autoplay) p.set('autoplay', '1');
    return `https://www.youtube-nocookie.com/embed/${l.id}?${p}`;
  }
  if (l.type === 'vimeo') {
    const p = new URLSearchParams({ controls: '0', title: '0', byline: '0', portrait: '0', dnt: '1', keyboard: '0', pip: '0' });
    if (l.hash) p.set('h', l.hash);
    if (autoplay) p.set('autoplay', '1');
    return `https://player.vimeo.com/video/${l.id}?${p}`;
  }
  return null;
}

export function pageLecteur(l: LienVideo, opts: { origine: string; titre?: string; autoplay?: boolean }): string | null {
  const src = urlPilotee(l, opts.origine.replace(/\/$/, ''), !!opts.autoplay);
  if (!src) return null;
  const titre = echapper(opts.titre ?? '');
  const affiche = miniature(l);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="referrer" content="strict-origin-when-cross-origin">
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
html,body{margin:0;height:100%;background:#000;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#f7e7c8}
#v{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none}
#calque{position:absolute;inset:0;cursor:pointer}
#affiche{position:absolute;inset:0;background:#000 center/cover no-repeat;transition:opacity .5s;pointer-events:none}
#voile{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#0008,#000d);transition:opacity .35s;pointer-events:none}
#haut{position:absolute;left:0;right:0;top:0;height:84px;padding:16px 18px;background:linear-gradient(#000 0,#000 48%,#0000);font-size:15px;font-weight:700;transition:opacity .3s;pointer-events:none;text-shadow:0 1px 4px #000}
#centre{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;border:0;background:#f0c36b;color:#1a1109;display:grid;place-items:center;box-shadow:0 10px 40px #f0c36b73;cursor:pointer;transition:transform .2s,opacity .25s}
#centre:active{transform:scale(.94)}
#attente{position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid #f0c36b33;border-top-color:#f0c36b;animation:t .8s linear infinite;display:none;pointer-events:none}
@keyframes t{to{transform:rotate(360deg)}}
#barre{position:absolute;left:0;right:0;bottom:0;padding:30px 14px 10px;background:linear-gradient(#0000,#000 55%);display:flex;align-items:center;gap:10px;transition:opacity .3s}
#barre button{background:none;border:0;color:#f7e7c8;width:36px;height:36px;display:grid;place-items:center;cursor:pointer;border-radius:8px;flex:none}
#barre button:hover{background:#ffffff1a}
#temps{font-size:12px;font-variant-numeric:tabular-nums;min-width:86px;text-align:center;flex:none}
#piste{flex:1;-webkit-appearance:none;appearance:none;height:4px;border-radius:4px;background:linear-gradient(90deg,#f0c36b var(--p,0%),#ffffff40 var(--p,0%));outline:none;cursor:pointer;margin:0}
#piste::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#f0c36b;border:0}
#piste::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#f0c36b;border:0}
.cache{opacity:0;pointer-events:none}
</style></head><body>
<iframe id="v" src="${src}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" tabindex="-1" title="${titre}"></iframe>
<div id="affiche"${affiche ? ` style="background-image:url(${affiche})"` : ''}></div>
<div id="voile"></div>
<div id="calque" aria-hidden="true"></div>
<div id="haut">${titre}</div>
<div id="attente"></div>
<button id="centre" aria-label="Lire"><svg width="30" height="30" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></button>
<div id="barre">
<button id="bLecture" aria-label="Lire ou mettre en pause"></button>
<input id="piste" type="range" min="0" max="1000" value="0" aria-label="Position dans la vidéo">
<span id="temps">0:00 / 0:00</span>
<button id="bSon" aria-label="Couper ou remettre le son"></button>
<button id="bPlein" aria-label="Plein écran"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
</div>
<script>
(function(){
var T=${JSON.stringify(l.type)},f=document.getElementById('v'),centre=document.getElementById('centre'),aff=document.getElementById('affiche'),voile=document.getElementById('voile'),barre=document.getElementById('barre'),haut=document.getElementById('haut'),attente=document.getElementById('attente'),piste=document.getElementById('piste'),temps=document.getElementById('temps'),bL=document.getElementById('bLecture'),bS=document.getElementById('bSon'),bP=document.getElementById('bPlein');
var I_PLAY='<svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',I_PAUSE='<svg width="20" height="20" viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>',I_SON='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',I_MUET='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
var e={joue:false,attente:false,t:0,d:0,muet:false,pret:false,commence:false,glisse:false},minuteur=null;
function poster(o){try{f.contentWindow.postMessage(JSON.stringify(o),'*')}catch(x){}}
function cmd(n,a){if(T==='youtube')poster({event:'command',func:n,args:a||[]});else poster(a===undefined?{method:n}:{method:n,value:a})}
function lire(){T==='youtube'?cmd('playVideo'):cmd('play')}
function pause(){T==='youtube'?cmd('pauseVideo'):cmd('pause')}
function aller(s){T==='youtube'?cmd('seekTo',[s,true]):cmd('setCurrentTime',s);e.t=s;rendre()}
function son(m){e.muet=m;T==='youtube'?cmd(m?'mute':'unMute'):cmd('setVolume',m?0:1);rendre()}
function signaler(t){var m={afroback:'lecteur',type:t};try{if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(m));else if(window.parent!==window)window.parent.postMessage(m,'*')}catch(x){}}
function hms(s){s=Math.max(0,Math.floor(s||0));var h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;return(h?h+':'+(m<10?'0':''):'')+m+':'+(r<10?'0':'')+r}
function etat(s){e.attente=s===3;if(s===1){if(!e.hd&&T==='youtube'){e.hd=true;cmd('setPlaybackQualityRange',['hd1080','hd1080']);cmd('setPlaybackQuality',['hd1080'])}e.joue=true;if(e.d&&e.t<e.d-2)e.fini=false;if(!e.commence){e.commence=true;signaler('lecture')}}else if(s===2||s===0||s===5||s===-1){e.joue=false}if(s===0&&!e.fini){e.fini=true;signaler('fin')}rendre();montrer()}
function rendre(){aff.classList.toggle('cache',e.commence);voile.classList.toggle('cache',e.joue||e.attente);bL.innerHTML=e.joue?I_PAUSE:I_PLAY;bS.innerHTML=e.muet?I_MUET:I_SON;centre.classList.toggle('cache',e.joue||e.attente);attente.style.display=e.attente?'block':'none';if(!e.glisse&&e.d){piste.value=String(Math.round(e.t/e.d*1000))}piste.style.setProperty('--p',(e.d?e.t/e.d*100:0)+'%');temps.textContent=hms(e.t)+' / '+hms(e.d)}
function montrer(){barre.classList.remove('cache');haut.classList.remove('cache');clearTimeout(minuteur);if(e.joue)minuteur=setTimeout(function(){barre.classList.add('cache');haut.classList.add('cache')},2600)}
window.addEventListener('message',function(ev){if(ev.source!==f.contentWindow)return;var d=ev.data;if(typeof d==='string'){try{d=JSON.parse(d)}catch(x){return}}if(!d)return;e.pret=true;
if(T==='youtube'){if(d.event==='onStateChange')etat(d.info);if((d.event==='infoDelivery'||d.event==='initialDelivery')&&d.info){var i=d.info;if(typeof i.currentTime==='number')e.t=i.currentTime;if(i.duration)e.d=i.duration;if(typeof i.muted==='boolean')e.muet=i.muted;if(typeof i.playerState==='number')etat(i.playerState);else rendre()}}
else{if(d.event==='ready'){['play','pause','ended','timeupdate','bufferstart','bufferend'].forEach(function(n){poster({method:'addEventListener',value:n})});poster({method:'getDuration'})}if(d.method==='getDuration'&&d.value)e.d=d.value;if(d.method==='getCurrentTime'&&typeof d.value==='number'){e.t=d.value;rendre()}if(d.event==='playProgress'&&d.data){e.t=d.data.seconds;rendre()}if(d.event==='timeupdate'&&d.data){e.t=d.data.seconds;e.d=d.data.duration||e.d;rendre()}if(d.event==='play')etat(1);if(d.event==='pause')etat(2);if(d.event==='ended')etat(0);if(d.event==='bufferstart')etat(3);if(d.event==='bufferend')etat(e.joue?1:2)}});
if(T==='vimeo'){setInterval(function(){if(e.joue&&!e.glisse)poster({method:'getCurrentTime'})},1000)}
if(T==='youtube'){var n=0,iv=setInterval(function(){if(e.pret||n++>60){clearInterval(iv);return}poster({event:'listening',id:1,channel:'widget'})},250);f.addEventListener('load',function(){poster({event:'listening',id:1,channel:'widget'})})}
function basculer(){e.joue?pause():lire();montrer()}
document.getElementById('calque').addEventListener('click',basculer);
centre.addEventListener('click',function(ev){ev.stopPropagation();lire()});
bL.addEventListener('click',basculer);
bS.addEventListener('click',function(){son(!e.muet)});
piste.addEventListener('input',function(){e.glisse=true;var s=piste.value/1000*e.d;e.t=s;rendre()});
piste.addEventListener('change',function(){e.glisse=false;aller(piste.value/1000*e.d)});
var racine=document.documentElement,pleinOk=!!(racine.requestFullscreen||racine.webkitRequestFullscreen);
if(!pleinOk)bP.style.display='none';
bP.addEventListener('click',function(){var fe=document.fullscreenElement||document.webkitFullscreenElement;if(fe){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else{(racine.requestFullscreen||racine.webkitRequestFullscreen).call(racine)}});
document.addEventListener('dblclick',function(){if(pleinOk)bP.click()});
document.addEventListener('contextmenu',function(ev){ev.preventDefault()});
document.addEventListener('keydown',function(ev){if(ev.key===' '||ev.key==='k'){ev.preventDefault();basculer()}else if(ev.key==='ArrowRight')aller(Math.min(e.d,e.t+10));else if(ev.key==='ArrowLeft')aller(Math.max(0,e.t-10));else if(ev.key==='m')son(!e.muet)});
document.addEventListener('pointermove',montrer);
rendre();montrer();
})();
</script></body></html>`;
}
