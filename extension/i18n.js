/* ChannelBlock — shared i18n dictionary.
 * Loaded both as a content script (the injected buttons/overlay) and as a
 * <script> in popup.html, so EN/FR strings live in exactly one place.
 * English is the default and the fallback for any missing key. */
'use strict';
var CW_I18N = (function () {
  const DICT = {
    en: {
      /* ── injected on youtube.com ── */
      block_channel: 'Block this channel',
      unblock_channel: 'Unblock this channel',
      toast_blocked: 'Blocked “{name}”',
      ov_title: 'Channel blocked',
      ov_desc: 'You blocked this channel with ChannelBlock. Its videos stay hidden across your feed, search and recommendations.',
      ov_unblock: 'Unblock channel',
      ov_show: 'Show anyway',

      /* ── popup ── */
      p_tagline: 'Channel blocking that sticks',
      on: 'On',
      off: 'Off',
      sec_filters: 'Filtering',
      t_enabled: 'ChannelBlock enabled',
      t_enabled_h: 'Master switch for everything below',
      t_hide: 'Hide blocked channels',
      t_hide_h: 'Purge their videos from every surface',
      t_buttons: 'Show block buttons',
      t_buttons_h: 'On every video & channel page',
      t_shorts: 'Block their Shorts too',
      t_shorts_h: 'Also remove Shorts from blocked channels',
      t_guard: 'Guard channel pages',
      t_guard_h: 'Cover a blocked channel’s own page',
      sec_list: 'Blocked channels',
      add_ph: 'Paste a channel URL or @handle…',
      add_btn: 'Block',
      add_invalid: 'Couldn’t read a channel from that. Use a full youtube.com channel URL or an @handle.',
      empty: 'No channels blocked yet. On YouTube, hover any video and click the 🚫 button — or paste a channel link above.',
      unblock: 'Unblock',
      n_blocked: '{n} blocked',
      export: 'Export',
      import: 'Import',
      clear: 'Clear all',
      clear_confirm: 'Remove all blocked channels?',
      sec_extra: 'Privacy',
      t_stats: 'Share anonymous stats',
      t_stats_h: 'Aggregate counts only · no identifiers',
      details: 'details',
      foot: 'Runs only on youtube.com — no account, no personal data.',
      reload: 'Reload tab',
      foot_link: 'Free & open source ↗'
    },
    fr: {
      block_channel: 'Bloquer cette chaîne',
      unblock_channel: 'Débloquer cette chaîne',
      toast_blocked: '« {name} » bloquée',
      ov_title: 'Chaîne bloquée',
      ov_desc: 'Vous avez bloqué cette chaîne avec ChannelBlock. Ses vidéos restent masquées dans votre fil, la recherche et les recommandations.',
      ov_unblock: 'Débloquer la chaîne',
      ov_show: 'Afficher quand même',

      p_tagline: 'Le blocage de chaînes qui tient',
      on: 'Actif',
      off: 'Inactif',
      sec_filters: 'Filtrage',
      t_enabled: 'ChannelBlock activé',
      t_enabled_h: 'Interrupteur principal de tout ce qui suit',
      t_hide: 'Masquer les chaînes bloquées',
      t_hide_h: 'Purge leurs vidéos de toutes les surfaces',
      t_buttons: 'Afficher les boutons de blocage',
      t_buttons_h: 'Sur chaque vidéo et page de chaîne',
      t_shorts: 'Bloquer aussi leurs Shorts',
      t_shorts_h: 'Retire également les Shorts des chaînes bloquées',
      t_guard: 'Protéger les pages de chaîne',
      t_guard_h: 'Recouvre la page d’une chaîne bloquée',
      sec_list: 'Chaînes bloquées',
      add_ph: 'Collez une URL de chaîne ou un @identifiant…',
      add_btn: 'Bloquer',
      add_invalid: 'Impossible de lire une chaîne. Utilisez une URL youtube.com complète ou un @identifiant.',
      empty: 'Aucune chaîne bloquée pour l’instant. Sur YouTube, survolez une vidéo et cliquez sur le bouton 🚫 — ou collez un lien de chaîne ci-dessus.',
      unblock: 'Débloquer',
      n_blocked: '{n} bloquée(s)',
      export: 'Exporter',
      import: 'Importer',
      clear: 'Tout effacer',
      clear_confirm: 'Supprimer toutes les chaînes bloquées ?',
      sec_extra: 'Confidentialité',
      t_stats: 'Partager des stats anonymes',
      t_stats_h: 'Comptes agrégés uniquement · aucun identifiant',
      details: 'détails',
      foot: 'Ne s’exécute que sur youtube.com — aucun compte, aucune donnée personnelle.',
      reload: 'Recharger l’onglet',
      foot_link: 'Gratuit & open source ↗'
    }
  };

  function detect(pref) {
    if (pref === 'en' || pref === 'fr') return pref;
    try {
      const l = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
      return l.indexOf('fr') === 0 ? 'fr' : 'en';
    } catch (_) { return 'en'; }
  }

  function t(lang, key, vars) {
    const d = DICT[lang] || DICT.en;
    let s = (d[key] != null) ? d[key] : (DICT.en[key] != null ? DICT.en[key] : key);
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }

  return { DICT, detect, t };
})();
if (typeof window !== 'undefined') window.CW_I18N = CW_I18N;
