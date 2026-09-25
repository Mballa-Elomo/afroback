# Classification par pays — Héros & Mythologie AFROBACK

> Les dossiers `Héros/` et `Mythologie/` sont maintenant classés par pays d'origine (`Héros/Cameroun/`, `Héros/Angola/`, `Mythologie/Cameroun/`), chacun contenant les dossiers-slugs individuels tels quels (`fr.md`, `en.md`, etc.).
>
> Réorganisé le 2026-09-25. Le pipeline de build (`build-heroes-data.mjs`, `build-mythologie-data.mjs`) et les agents `afroback-griot`/`afroback-traducteur-ewondo`/`afroback-storyboard` ont été mis à jour pour lire ces nouveaux chemins.

---

## 🇨🇲 Cameroun — 13 éléments

### Héros (8) — `Héros/Cameroun/`

| Héros | Région / peuple | Époque |
|---|---|---|
| [Sultan Njoya](Héros/Cameroun/sultan-njoya/fr.md) | Ouest — royaume Bamoun (Foumban) | fin XIXe – début XXe siècle |
| [Ernest Ouandié](Héros/Cameroun/ernest-ouandie/fr.md) | Ouest — pays bamiléké | 1924–1971 |
| [Félix Moumié](Héros/Cameroun/felix-moumie/fr.md) | Ouest — Foumban/Njissé (actif national) | 1925–1960 |
| [Charles Atangana](Héros/Cameroun/charles-atangana/fr.md) | Centre — Ewondo/Bané (Yaoundé) | fin XIXe siècle–1943 |
| [Ruben Um Nyobè](Héros/Cameroun/ruben-um-nyobe/fr.md) | Centre/Littoral (actif national, base à Douala) | 1913–1958 |
| [Manu Dibango](Héros/Cameroun/manu-dibango/fr.md) | Littoral — Douala (peuples yabassi/douala) | 1933–2020 |
| [Rudolf Douala Manga Bell](Héros/Cameroun/rudolf-douala-manga-bell/fr.md) | Littoral — clan Bell, Douala | vers 1873–1914 |
| [Martin Paul Samba](Héros/Cameroun/martin-paul-samba/fr.md) | Sud — peuple bulu | fin XIXe – début XXe siècle |

### Mythologie (5) — `Mythologie/Cameroun/`

| Mythe | Région / peuple |
|---|---|
| [Nchare Yen](Mythologie/Cameroun/mythe-nchare-yen-bamoun/fr.md) — légende fondatrice du royaume Bamoun | Ouest (Foumban) |
| [Ngan Medza](Mythologie/Cameroun/mythe-ngan-medza-beti/fr.md) — légende migratoire des Beti-Fang | Centre (fleuve Sanaga) |
| [Miengu](Mythologie/Cameroun/mythe-miengu-esprits-eau-sawa/fr.md) — esprits de l'eau des peuples Sawa | Littoral (côte, Wouri) |
| [Ngog Lituba](Mythologie/Cameroun/mythe-ngog-lituba-bassa/fr.md) — mythe fondateur Bassa/Bakoko/Bati | Littoral (Sanaga-Maritime) |
| [Sao, les géants](Mythologie/Cameroun/mythe-sao-geants-kotoko/fr.md) — légende fondatrice du peuple Kotoko | Extrême-Nord (lac Tchad) |

## 🇦🇴 Angola — 1 élément

### Héros (1) — `Héros/Angola/`

| Héros | Région / peuple | Époque |
|---|---|---|
| [Reine Nzinga](Héros/Angola/reine-nzinga/fr.md) | Royaumes de Ndongo et Matamba | XVIIe siècle |

---

## Récapitulatif

| Pays | Héros | Mythologie | Total |
|---|---|---|---|
| Cameroun | 8 | 5 | 13 |
| Angola | 1 | 0 | 1 |
| **Total** | **9** | **5** | **14** |

## Ce qui a été fait

- Déplacement physique via `git mv` (historique git conservé) : `Héros/{slug}/` → `Héros/{Pays}/{slug}/`, `Mythologie/{slug}/` → `Mythologie/{Pays}/{slug}/`.
- Mise à jour de `app-mobile/mobile-app/scripts/build-heroes-data.mjs` et `build-mythologie-data.mjs` (chemins de lecture + `pays` ajouté par slug), régénéré `heroes.generated.json`/`mythologie.generated.json` — vérifié sans erreur.
- Mise à jour des agents `afroback-griot`, `afroback-traducteur-ewondo`, `afroback-storyboard` et de la commande `/afroback_storyboard` pour qu'ils écrivent/lisent désormais dans `Héros/[Pays]/[slug]/` et `Mythologie/[Pays]/[slug]/`.
- Le dossier `Récits africains storyboards/` (sorties du storyboardeur) reste volontairement plat, non demandé dans le classement par pays.
- Aucun changement côté app mobile / Supabase : la donnée servie à l'app (table `heros`, `mythes`) est inchangée, seul le classement des fichiers source dans le workspace a bougé.

**Constat inchangé** : le catalogue reste à 93 % camerounais (13/14). Un vrai classement "par pays" utile dans l'app (hub pays, filtre) suppose d'élargir le contenu à d'autres pays — question de périmètre produit non tranchée ici.
