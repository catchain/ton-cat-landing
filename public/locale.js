(function () {
  var LOCALE_STORAGE_KEY = 'locale';

  var SPANISH_COUNTRIES = new Set([
    'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO',
    'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ', 'AD',
  ]);

  var translations = {
    en: {
      'meta.title': 'TON Core — Independent Contributor Building Decentralized Future',
      'meta.description': 'An independent contributor building decentralized future on TON blockchain.',
      'hero.title':
        'An independent contributor building <span class="gradient-text">decentralized future</span>',
      'nav.mission': 'Mission',
      'nav.projects': 'Projects',
      'nav.news': 'News Feed',
      'nav.github': 'Github',
      'nav.telegram': 'Telegram',
      'projects.stakee.desc':
        'Stake TON with the best APY — no lock-ups, manage right in Telegram.',
      'projects.tonscan.desc':
        'Explore blocks, transactions, and accounts across the TON blockchain.',
      'projects.richcats.desc':
        'Collect and customize unique NFT cats on the TON network.',
    },
    es: {
      'meta.title': 'TON Core — Contribuyente independiente construyendo un futuro descentralizado',
      'meta.description':
        'Un contribuyente independiente que construye un futuro descentralizado en la blockchain TON.',
      'hero.title':
        'Un contribuyente independiente que construye <span class="gradient-text">un futuro descentralizado</span>',
      'nav.mission': 'Misión',
      'nav.projects': 'Proyectos',
      'nav.news': 'Noticias',
      'nav.github': 'Github',
      'nav.telegram': 'Telegram',
      'projects.stakee.desc':
        'Apuesta TON con el mejor APY — sin bloqueos, gestiona directamente en Telegram.',
      'projects.tonscan.desc':
        'Explora bloques, transacciones y cuentas en la blockchain TON.',
      'projects.richcats.desc':
        'Colecciona y personaliza gatos NFT únicos en la red TON.',
    },
  };

  function parseHashLocale() {
    var hash = (location.hash || '').replace(/^#/, '').toLowerCase();
    if (hash === 'en') return 'en';
    if (hash === 'es' || hash === 'ca') return 'es';
    return null;
  }

  function readStoredLocale() {
    try {
      var stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === 'en' || stored === 'es') return stored;
    } catch (error) {
      /* ignore storage errors */
    }
    return null;
  }

  function persistLocale(locale) {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (error) {
      /* ignore storage errors */
    }
  }

  function prefersSpanishFromBrowser() {
    var languages = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < languages.length; i++) {
      var code = String(languages[i] || '').toLowerCase();
      if (code.indexOf('es') === 0 || code.indexOf('ca') === 0) {
        return true;
      }
    }
    return false;
  }

  function countryFromTrace(text) {
    var match = text.match(/^loc=([A-Z]{2})$/m);
    return match ? match[1] : null;
  }

  function detectLocaleFromGeoOrBrowser() {
    return fetch('/cdn-cgi/trace', { credentials: 'same-origin' })
      .then(function (response) {
        if (!response.ok) throw new Error('trace unavailable');
        return response.text();
      })
      .then(function (text) {
        var country = countryFromTrace(text);
        if (country && SPANISH_COUNTRIES.has(country)) return 'es';
        return 'en';
      })
      .catch(function () {
        return prefersSpanishFromBrowser() ? 'es' : 'en';
      });
  }

  function resolveLocale() {
    var hashLocale = parseHashLocale();
    if (hashLocale) {
      persistLocale(hashLocale);
      return Promise.resolve(hashLocale);
    }

    var storedLocale = readStoredLocale();
    if (storedLocale) return Promise.resolve(storedLocale);

    return detectLocaleFromGeoOrBrowser();
  }

  function applyLocale(locale) {
    var strings = translations[locale] || translations.en;

    document.documentElement.lang = locale;
    document.title = strings['meta.title'];

    var description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', strings['meta.description']);

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', strings['meta.title']);

    var ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', strings['meta.description']);

    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var key = node.getAttribute('data-i18n');
      if (strings[key]) node.textContent = strings[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-html');
      if (strings[key]) node.innerHTML = strings[key];
    });
  }

  function initLocale() {
    var done = false;

    function finish(locale) {
      if (done) return;
      done = true;
      applyLocale(locale);
      document.body.classList.add('ready');
    }

    var timeout = setTimeout(function () {
      finish(readStoredLocale() || (prefersSpanishFromBrowser() ? 'es' : 'en'));
    }, 3000);

    resolveLocale().then(function (locale) {
      clearTimeout(timeout);
      finish(locale);
    });
  }

  window.addEventListener('hashchange', function () {
    resolveLocale().then(function (locale) {
      applyLocale(locale);
      document.body.classList.add('ready');
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocale);
  } else {
    initLocale();
  }
})();
