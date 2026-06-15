/* ChannelBlock landing — EN/FR i18n.
 * English is the default & fallback; French auto-detected from the browser and
 * switchable via the header toggle (persisted in localStorage). */
(function () {
  'use strict';
  var DICT = {
    en: {
      nav_why: 'Why', nav_how: 'How it works', nav_install: 'Install', nav_faq: 'FAQ', nav_dl: 'Download — Free',
      hero_eyebrow: 'Browser extension · Free & open source',
      hero_h1: 'Block YouTube channels.<br><em>For good this time.</em>',
      hero_lede: 'YouTube’s “not interested” and “don’t recommend this channel” are soft signals the algorithm quietly overrides — the same channels keep crawling back. ChannelBlock adds a real one-click block button and purges that channel’s videos and Shorts from home, search and recommendations. Block once; they stay gone.',
      hero_dl: '↓ Download — Free', hero_how: 'How to install',
      hero_trust: '<b>100% free, no subscription.</b> The block button YouTube refuses to ship — no account, no paywall, ever.',
      hero_m1: '<b>No account</b> · nothing to sign up for',
      hero_m2: '<b>No personal data</b> · anonymous, opt-out stats',
      hero_m3: '<b>Open source · MV3</b> · <a href="https://github.com/zlef-fr/channelblock" target="_blank" rel="noopener" style="color:var(--zl-olive-soft)">on GitHub</a>',
      p_tagline: 'Channel blocking that sticks', on: 'On', unblock: 'Unblock', mock_sec: 'Blocked channels · 3',
      stats_eyebrow: 'Live · anonymous & aggregate', stats_channels: 'Channels blocked', stats_hidden: 'Videos hidden from feeds',
      stats_counting: 'Counting…', stats_fresh: 'Freshly launched — these climb as people install it.',
      stats_live: 'Counted anonymously across everyone running ChannelBlock.', stats_raw: 'See the raw numbers ↗',
      why_eyebrow: 'The block button that’s missing', why_h2: '“Not interested” doesn’t stick. This does.',
      why_lede: 'YouTube has no hard block for channels — its controls are hints the algorithm overrides within days. ChannelBlock is deterministic: a channel you block is filtered on every page load, with no algorithm to second-guess you.',
      why_c1_h: 'One click, everywhere', why_c1_p: 'Hover any video and hit the block button — that channel vanishes from home, search, the sidebar, recommendations and Shorts at once. No buried menus, no repeated taps.',
      why_c2_h: 'Actually permanent', why_c2_p: 'Blocked channels stay gone instead of creeping back. The filter runs before every paint, so there’s nothing for the recommendation engine to revive.',
      why_c3_h: 'A calmer feed', why_c3_p: 'Cut rage-bait, spam re-uploads, reaction farms and channels you simply dislike. What’s left is the stuff you actually came to watch.',
      why_c4_h: 'Genuinely free', why_c4_p: 'No subscription, no trial countdown, nothing gated behind “Pro”. Cross-browser blocklist sync may arrive later as an optional extra — never the core.',
      why_c5_h: 'Private by design', why_c5_p: 'Your blocklist lives on your device. No accounts, no identifiers, no IP logging, never your browsing — only an anonymous, opt-out usage count.',
      why_c6_h: 'Tiny & open', why_c6_p: 'A small content script, no background bloat, MIT-licensed and fully public on GitHub — so you can read every line before you trust it.',
      how_eyebrow: 'Under the hood', how_h2: 'How it works',
      how_lede: 'No remote code, no accounts — just a content script that runs on youtube.com and keeps your blocklist on-device.',
      how_1_h: 'Block in one click', how_1_p: 'The 🚫 button on each video — and on channel pages — captures the channel’s <code>@handle</code> or <code>/channel/</code> id and saves it locally.',
      how_2_h: 'Hides before paint', how_2_p: 'A stylesheet injected at <code>document_start</code> hides cards whose channel link matches your blocklist, so they never flash in.',
      how_3_h: 'Catches the rest', how_3_p: 'A light DOM sweep handles cards without a channel link and the Shorts shelf, matching by handle, id or name.',
      how_4_h: 'Survives the SPA', how_4_p: 'A MutationObserver plus navigation hooks re-apply on every in-app route change, so blocks hold as you browse.',
      install_eyebrow: 'One minute, any Chromium browser', install_h2: 'Install it',
      install_lede: 'Works in Chrome, Edge, Brave and any Chromium browser. It won’t be on the Chrome Web Store (<a href="#faq" style="color:var(--zl-olive-soft)">why?</a>) — you load it unpacked, which takes about a minute and lets you read every line of the <a href="https://github.com/zlef-fr/channelblock" target="_blank" rel="noopener" style="color:var(--zl-olive-soft)">open source</a> first.',
      install_1_h: 'Download & unzip', install_1_p: 'Grab <a href="/channelblock.zip?v=1.0.0" download style="color:var(--zl-olive-soft)">channelblock.zip</a> and extract it anywhere.',
      install_2_h: 'Open extensions', install_2_p: 'Go to <code>chrome://extensions</code> and turn on <b>Developer mode</b> (top right).',
      install_3_h: 'Load unpacked', install_3_p: 'Click <b>Load unpacked</b> and select the unzipped <code>channelblock</code> folder.',
      install_4_h: 'Open YouTube', install_4_p: 'Reload any YouTube tab and hover a video — the block button is right there.',
      install_ff: 'Using Firefox? Grab the <a href="/channelblock-firefox.xpi?v=1.0.0" download>signed-build XPI</a> — an AMO listing is on the way.',
      faq_eyebrow: 'Questions', faq_h2: 'Good to know',
      faq_1_q: 'How is this different from “Don’t recommend channel”?',
      faq_1_a: 'YouTube’s option is a soft signal — it nudges the algorithm, which routinely surfaces the channel again within days. ChannelBlock is a hard, deterministic filter: a blocked channel is removed on every page load, across home, search, recommendations and Shorts, until you unblock it.',
      faq_2_q: 'What data does it collect?',
      faq_2_a: 'Your blocklist stays on your device. The only thing it ever sends is an <b>anonymous, aggregate, opt-out</b> snapshot about once per browsing session: the version, which toggles are on, and two counters (channels blocked, videos hidden). <b>No account, no identifier, no IP stored, no URLs, never your browsing.</b> Turn off “Share anonymous stats” and nothing is sent. Every number we hold is public at <a href="https://channelblock.zlef.fr/api/stats" target="_blank" rel="noopener" style="color:var(--zl-olive-soft)">/api/stats</a>.',
      faq_3_q: 'Is it really free? What’s the catch?',
      faq_3_a: 'It’s free, no catch and no subscription. Cross-device blocklist sync may arrive later as an optional paid extra, but the core blocking is never gated.',
      faq_4_q: 'Why isn’t it on the Chrome Web Store?',
      faq_4_a: 'An extension that hides channels cuts against YouTube’s own product, so we don’t expect a smooth review. ChannelBlock ships as an unpacked install from the <a href="/channelblock.zip?v=1.0.0" download style="color:var(--zl-olive-soft)">zip</a> (which also lets you read every line first). It’s tiny, MIT-licensed and the full source is on <a href="https://github.com/zlef-fr/channelblock" target="_blank" rel="noopener" style="color:var(--zl-olive-soft)">GitHub</a>.',
      faq_5_q: 'Is there a Firefox version?',
      faq_5_a: 'Yes — grab the <a href="/channelblock-firefox.xpi?v=1.0.0" download style="color:var(--zl-olive-soft)">XPI</a>. Since Mozilla’s policies are friendlier to this kind of tool, it may also land on <b>addons.mozilla.org</b> as a one-click install.',
      faq_6_q: 'Can I move my blocklist between browsers?',
      faq_6_a: 'Yes. Use Export in the popup to save your blocklist as a JSON file, then Import it in another browser or profile. You can also paste a channel URL or @handle to block without visiting it.',
      faq_7_q: 'A blocked channel still slips through — what do I do?',
      faq_7_a: 'YouTube changes its markup often. ChannelBlock matches channels by their handle and id rather than fragile labels, and a watchdog re-applies after navigation. If something new appears, reload the tab from the popup; updates ship to keep coverage complete.',
      dl_eyebrow: 'Free forever', dl_h2: 'Take back your feed tonight.',
      dl_lede: 'No account. No paywall. No personal data. Just YouTube without the channels you’re done with.',
      foot_privacy: 'Privacy', foot_more: 'More by ZLEF'
    },
    fr: {
      nav_why: 'Pourquoi', nav_how: 'Comment ça marche', nav_install: 'Installer', nav_faq: 'FAQ', nav_dl: 'Télécharger — Gratuit',
      hero_eyebrow: 'Extension de navigateur · Gratuite & open source',
      hero_h1: 'Bloquez des chaînes YouTube.<br><em>Cette fois, pour de bon.</em>',
      hero_lede: 'Les options « pas intéressé » et « ne plus recommander cette chaîne » de YouTube ne sont que des signaux que l’algorithme ignore vite — les mêmes chaînes reviennent sans cesse. ChannelBlock ajoute un vrai bouton de blocage en un clic et purge les vidéos et Shorts de cette chaîne de l’accueil, de la recherche et des recommandations. Bloquez une fois ; elles disparaissent.',
      hero_dl: '↓ Télécharger — Gratuit', hero_how: 'Comment installer',
      hero_trust: '<b>100% gratuit, sans abonnement.</b> Le bouton de blocage que YouTube refuse de proposer — sans compte, sans paywall, jamais.',
      hero_m1: '<b>Sans compte</b> · rien à créer',
      hero_m2: '<b>Aucune donnée perso</b> · stats anonymes, désactivables',
      hero_m3: '<b>Open source · MV3</b> · <a href="https://github.com/zlef-fr/channelblock" target="_blank" rel="noopener" style="color:var(--zl-olive-soft)">sur GitHub</a>',
      p_tagline: 'Le blocage de chaînes qui tient', on: 'Actif', unblock: 'Débloquer', mock_sec: 'Chaînes bloquées · 3',
      stats_eyebrow: 'En direct · anonyme & agrégé', stats_channels: 'Chaînes bloquées', stats_hidden: 'Vidéos masquées des fils',
      stats_counting: 'Comptage…', stats_fresh: 'Tout juste lancé — ça grimpe à mesure des installations.',
      stats_live: 'Compté anonymement chez tous les utilisateurs de ChannelBlock.', stats_raw: 'Voir les chiffres bruts ↗',
      why_eyebrow: 'Le bouton de blocage manquant', why_h2: '« Pas intéressé » ne tient pas. Ça, oui.',
      why_lede: 'YouTube n’a aucun blocage dur pour les chaînes — ses commandes sont des indices que l’algorithme contourne en quelques jours. ChannelBlock est déterministe : une chaîne bloquée est filtrée à chaque chargement, sans algorithme pour vous contredire.',
      why_c1_h: 'Un clic, partout', why_c1_p: 'Survolez une vidéo et cliquez sur le bouton de blocage — la chaîne disparaît d’un coup de l’accueil, de la recherche, de la sidebar, des recommandations et des Shorts. Pas de menus cachés, pas de clics répétés.',
      why_c2_h: 'Vraiment permanent', why_c2_p: 'Les chaînes bloquées restent absentes au lieu de revenir. Le filtre s’applique avant chaque rendu : rien à ranimer pour le moteur de recommandation.',
      why_c3_h: 'Un fil plus calme', why_c3_p: 'Coupez le rage-bait, les re-uploads spam, les fermes de réactions et les chaînes que vous n’aimez tout simplement pas. Reste ce que vous êtes venu regarder.',
      why_c4_h: 'Vraiment gratuit', why_c4_p: 'Pas d’abonnement, pas de compte à rebours, rien derrière un « Pro ». La synchro de la liste entre navigateurs pourra arriver en option — jamais le cœur.',
      why_c5_h: 'Privé par conception', why_c5_p: 'Votre liste reste sur votre appareil. Aucun compte, aucun identifiant, aucune IP, jamais votre navigation — seulement un comptage d’usage anonyme et désactivable.',
      why_c6_h: 'Minuscule & ouvert', why_c6_p: 'Un petit content script, aucun bloat en arrière-plan, sous licence MIT et public sur GitHub — lisez chaque ligne avant de faire confiance.',
      how_eyebrow: 'Sous le capot', how_h2: 'Comment ça marche',
      how_lede: 'Aucun code distant, aucun compte — juste un content script sur youtube.com qui garde votre liste en local.',
      how_1_h: 'Bloquer en un clic', how_1_p: 'Le bouton 🚫 sur chaque vidéo — et sur les pages de chaîne — capture le <code>@handle</code> ou l’id <code>/channel/</code> de la chaîne et l’enregistre en local.',
      how_2_h: 'Masque avant le rendu', how_2_p: 'Une feuille de style injectée au <code>document_start</code> masque les cartes dont le lien de chaîne correspond à votre liste, sans clignotement.',
      how_3_h: 'Attrape le reste', how_3_p: 'Un balayage DOM léger gère les cartes sans lien de chaîne et l’étagère Shorts, par handle, id ou nom.',
      how_4_h: 'Résiste au SPA', how_4_p: 'Un MutationObserver et des hooks de navigation se réappliquent à chaque changement de route : les blocages tiennent pendant la navigation.',
      install_eyebrow: 'Une minute, n’importe quel Chromium', install_h2: 'Installez-la',
      install_lede: 'Fonctionne sur Chrome, Edge, Brave et tout navigateur Chromium. Elle ne sera pas sur le Chrome Web Store (<a href="#faq" style="color:var(--zl-olive-soft)">pourquoi ?</a>) — vous la chargez décompressée, en une minute, ce qui vous laisse lire chaque ligne de l’<a href="https://github.com/zlef-fr/channelblock" target="_blank" rel="noopener" style="color:var(--zl-olive-soft)">open source</a> avant.',
      install_1_h: 'Télécharger & dézipper', install_1_p: 'Récupérez <a href="/channelblock.zip?v=1.0.0" download style="color:var(--zl-olive-soft)">channelblock.zip</a> et extrayez-le où vous voulez.',
      install_2_h: 'Ouvrir les extensions', install_2_p: 'Allez sur <code>chrome://extensions</code> et activez le <b>Mode développeur</b> (en haut à droite).',
      install_3_h: 'Charger non empaqueté', install_3_p: 'Cliquez sur <b>Charger l’extension non empaquetée</b> et choisissez le dossier <code>channelblock</code> décompressé.',
      install_4_h: 'Ouvrir YouTube', install_4_p: 'Rechargez un onglet YouTube et survolez une vidéo — le bouton de blocage est là.',
      install_ff: 'Sur Firefox ? Récupérez le <a href="/channelblock-firefox.xpi?v=1.0.0" download>XPI signé</a> — une fiche AMO arrive.',
      faq_eyebrow: 'Questions', faq_h2: 'Bon à savoir',
      faq_1_q: 'En quoi c’est différent de « Ne plus recommander » ?',
      faq_1_a: 'L’option de YouTube est un signal souple — elle oriente l’algorithme, qui refait surface la chaîne en quelques jours. ChannelBlock est un filtre dur et déterministe : une chaîne bloquée est retirée à chaque chargement, sur l’accueil, la recherche, les recommandations et les Shorts, jusqu’à déblocage.',
      faq_2_q: 'Quelles données sont collectées ?',
      faq_2_a: 'Votre liste reste sur votre appareil. La seule chose envoyée est un instantané <b>anonyme, agrégé et désactivable</b>, environ une fois par session : la version, les options activées et deux compteurs (chaînes bloquées, vidéos masquées). <b>Aucun compte, aucun identifiant, aucune IP, aucune URL, jamais votre navigation.</b> Désactivez « Partager des stats anonymes » et rien n’est envoyé. Tous nos chiffres sont publics sur <a href="https://channelblock.zlef.fr/api/stats" target="_blank" rel="noopener" style="color:var(--zl-olive-soft)">/api/stats</a>.',
      faq_3_q: 'C’est vraiment gratuit ? Où est le piège ?',
      faq_3_a: 'C’est gratuit, sans piège ni abonnement. La synchro de liste entre appareils pourra arriver en option payante, mais le blocage de base n’est jamais bloqué derrière un paywall.',
      faq_4_q: 'Pourquoi pas sur le Chrome Web Store ?',
      faq_4_a: 'Une extension qui masque des chaînes va à l’encontre du produit de YouTube ; on ne s’attend pas à une review facile. ChannelBlock s’installe non empaquetée depuis le <a href="/channelblock.zip?v=1.0.0" download style="color:var(--zl-olive-soft)">zip</a> (qui vous laisse tout lire avant). Minuscule, sous licence MIT, source complète sur <a href="https://github.com/zlef-fr/channelblock" target="_blank" rel="noopener" style="color:var(--zl-olive-soft)">GitHub</a>.',
      faq_5_q: 'Y a-t-il une version Firefox ?',
      faq_5_a: 'Oui — récupérez le <a href="/channelblock-firefox.xpi?v=1.0.0" download style="color:var(--zl-olive-soft)">XPI</a>. Les règles de Mozilla étant plus accueillantes, il pourrait aussi arriver sur <b>addons.mozilla.org</b> en un clic.',
      faq_6_q: 'Puis-je transférer ma liste entre navigateurs ?',
      faq_6_a: 'Oui. Utilisez Exporter dans le popup pour sauvegarder votre liste en JSON, puis Importer dans un autre navigateur ou profil. Vous pouvez aussi coller une URL de chaîne ou un @handle pour bloquer sans la visiter.',
      faq_7_q: 'Une chaîne bloquée passe encore — que faire ?',
      faq_7_a: 'YouTube change souvent son markup. ChannelBlock identifie les chaînes par leur handle et leur id plutôt que par des libellés fragiles, et un watchdog se réapplique après navigation. Si quelque chose de nouveau apparaît, rechargez l’onglet depuis le popup ; des mises à jour maintiennent la couverture.',
      dl_eyebrow: 'Gratuit pour toujours', dl_h2: 'Reprenez votre fil ce soir.',
      dl_lede: 'Sans compte. Sans paywall. Sans donnée perso. Juste YouTube sans les chaînes dont vous avez fini.',
      foot_privacy: 'Confidentialité', foot_more: 'Plus par ZLEF'
    }
  };

  var lang = 'en';
  function detect() {
    try {
      var saved = localStorage.getItem('cb_lang');
      if (saved === 'en' || saved === 'fr') return saved;
      var l = (navigator.language || 'en').toLowerCase();
      return l.indexOf('fr') === 0 ? 'fr' : 'en';
    } catch (_) { return 'en'; }
  }
  window.CB_T = function (key) { var d = DICT[lang] || DICT.en; return d[key] != null ? d[key] : (DICT.en[key] != null ? DICT.en[key] : key); };

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = window.CB_T(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = window.CB_T(el.getAttribute('data-i18n-html')); });
    document.querySelectorAll('.langsw button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-lang') === lang); });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.langsw button');
    if (!b) return;
    lang = b.getAttribute('data-lang');
    try { localStorage.setItem('cb_lang', lang); } catch (_) {}
    apply();
  });

  lang = detect();
  apply();
})();
