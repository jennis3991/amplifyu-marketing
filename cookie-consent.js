/*
 * AmplifyU cookie consent banner + GA4 gate.
 * Include on every page with: <script src="cookie-consent.js" defer></script>
 * GA4 (gtag.js) is only ever injected into the DOM after the user clicks
 * "Accept All" — until then, no request to googletagmanager.com is made
 * and no analytics cookies are set.
 */
(function () {
  var GA_ID = 'G-FR694468F6';
  var STORAGE_KEY = 'amplifyu_cookie_consent'; // 'accepted' | 'rejected'

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function loadGA() {
    window['ga-disable-' + GA_ID] = false;

    if (window.__amplifyuGaLoaded) return;
    window.__amplifyuGaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);
  }

  // Stops any GA instance already loaded this session (e.g. the user
  // accepted earlier, then reopened Cookie Settings and rejected) from
  // sending further hits — gtag.js checks this flag before every hit.
  function disableGA() {
    window['ga-disable-' + GA_ID] = true;
  }

  // Wipes any GA cookies for this domain, covering both cookies gtag.js
  // itself would have set (_ga, _ga_<container-id>, _gid, _gat...) and
  // any left over from before this consent banner existed.
  function clearGACookies() {
    var GA_COOKIE_PATTERN = /^_ga(_.*)?$|^_gid$|^_gat(_.*)?$|^_gac_.*$/i;
    var host = window.location.hostname;
    var hostParts = host.split('.');
    var rootDomain = hostParts.length > 2 ? hostParts.slice(-2).join('.') : host;
    var domainVariants = ['', host, '.' + host];
    if (rootDomain !== host) {
      domainVariants.push(rootDomain, '.' + rootDomain);
    }

    document.cookie.split(';').forEach(function (chunk) {
      var name = chunk.split('=')[0].trim();
      if (!name || !GA_COOKIE_PATTERN.test(name)) return;

      domainVariants.forEach(function (domain) {
        var cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        if (domain) cookieStr += '; domain=' + domain;
        document.cookie = cookieStr;
      });
    });
  }

  function injectStyles() {
    var css =
      '#cookie-consent-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
      'background:#1a1714;color:#F7F3EC;border-top:1px solid rgba(201,169,110,0.35);' +
      'padding:24px 32px;font-family:"Inter",system-ui,sans-serif;' +
      'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;' +
      'box-shadow:0 -8px 32px rgba(0,0,0,0.35);}' +
      '#cookie-consent-banner .cc-text{flex:1 1 320px;font-size:14px;line-height:1.65;color:rgba(247,243,236,0.75);}' +
      '#cookie-consent-banner .cc-title{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;' +
      'font-size:18px;color:#F7F3EC;display:block;margin-bottom:4px;}' +
      '#cookie-consent-banner .cc-actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center;flex:0 0 auto;}' +
      '#cookie-consent-banner button{font-family:"Inter",system-ui,sans-serif;font-size:11px;font-weight:500;' +
      'letter-spacing:0.08em;text-transform:uppercase;padding:13px 24px;border-radius:3px;cursor:pointer;' +
      'background:transparent;color:#F7F3EC;border:1px solid rgba(247,243,236,0.35);' +
      'transition:border-color 0.2s ease,color 0.2s ease;white-space:nowrap;}' +
      '#cookie-consent-banner button:hover{border-color:#8A9E84;color:#8A9E84;}' +
      '#cookie-consent-banner .cc-link{color:#C9A96E;text-decoration:underline;text-underline-offset:2px;}' +
      '#cookie-consent-banner .cc-link:hover{color:#8A9E84;}' +
      '#cookie-settings-bar{background:#0F0D0A;border-top:1px solid rgba(255,255,255,0.06);' +
      'padding:14px 48px;text-align:center;}' +
      '.cookie-settings-link{font-family:"Inter",system-ui,sans-serif;font-size:11px;color:rgba(247,243,236,0.4);' +
      'text-decoration:underline;text-underline-offset:2px;cursor:pointer;background:none;border:none;padding:0;}' +
      '.cookie-settings-link:hover{color:#8A9E84;}' +
      '@media (max-width:640px){#cookie-consent-banner{padding:20px;flex-direction:column;align-items:stretch;}' +
      '#cookie-consent-banner .cc-actions{flex-direction:column;}' +
      '#cookie-consent-banner button{width:100%;}}';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  var bannerEl = null;

  function buildBanner() {
    var el = document.createElement('div');
    el.id = 'cookie-consent-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML =
      '<div class="cc-text"><span class="cc-title">We use cookies</span>' +
      'We’d like to use optional analytics cookies to understand how this site is used — they only load ' +
      'if you accept. <a href="cookie-policy.html" class="cc-link">Learn more in our Cookie Policy</a>.</div>' +
      '<div class="cc-actions">' +
        '<button type="button" class="cc-reject">Reject Non-Essential</button>' +
        '<button type="button" class="cc-accept">Accept All</button>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('.cc-accept').addEventListener('click', function () {
      setConsent('accepted');
      hideBanner();
      loadGA();
    });
    el.querySelector('.cc-reject').addEventListener('click', function () {
      setConsent('rejected');
      hideBanner();
      disableGA();
      clearGACookies();
    });

    return el;
  }

  function showBanner() {
    if (!bannerEl) bannerEl = buildBanner();
    bannerEl.style.display = 'flex';
  }

  function hideBanner() {
    if (bannerEl) bannerEl.style.display = 'none';
  }

  function addSettingsLink() {
    var footer = document.querySelector('footer');
    if (!footer || document.getElementById('cookie-settings-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'cookie-settings-bar';

    var link = document.createElement('button');
    link.type = 'button';
    link.className = 'cookie-settings-link';
    link.textContent = 'Cookie Settings';
    link.addEventListener('click', showBanner);

    bar.appendChild(link);
    footer.insertAdjacentElement('afterend', bar);
  }

  function init() {
    injectStyles();

    var consent = getConsent();
    if (consent === 'accepted') {
      loadGA();
    } else if (consent === 'rejected') {
      // Catches lingering GA cookies for returning visitors who rejected
      // under the old setup, before this cleanup step existed.
      clearGACookies();
    } else {
      showBanner();
    }

    addSettingsLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
