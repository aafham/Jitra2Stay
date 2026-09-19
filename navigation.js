/* Progressive navigation and mobile shortcuts. Load with defer after app.js.
 * Existing anchors and the menu work independently of this enhancement.
 * ResizeObserver catches gallery/filter height changes; no custom events or
 * stored language, form, guest, or note values are required.
 */
(() => {
  'use strict';

  const main = document.getElementById('mainContent');
  const home = document.getElementById('home');
  const nav = document.getElementById('mainNav');
  if (!main) return;
  const isHome = Boolean(home && home.parentElement === main && nav);

  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menuToggle');
  const bar = document.querySelector('.mobile-action-bar');
  const panel = main.querySelector('.enquiry-panel');
  const form = document.getElementById('dateForm');
  const navIds = new Set(['tentang', 'galeri', 'kadar', 'kemudahan', 'lokasi']);
  const sectionIds = new Set(['home', ...navIds, 'faq', 'semak-tarikh']);
  const sections = Array.from(main.children).filter((element) =>
    element.tagName === 'SECTION' && sectionIds.has(element.id));
  const links = (isHome ? Array.from(nav.children) : []).filter((element) =>
    element.tagName === 'A' && navIds.has(element.getAttribute('href')?.slice(1)) &&
    element.getAttribute('href').startsWith('#'));
  let currentNav;
  let readingSection = 'home';
  let frame = 0;
  let barHeight = 0;

  function viewport() {
    const visual = window.visualViewport;
    const top = visual?.offsetTop || 0;
    const left = visual?.offsetLeft || 0;
    return {
      top,
      bottom: top + (visual?.height || window.innerHeight),
      left,
      right: left + (visual?.width || window.innerWidth),
    };
  }

  function visibleTop(view) {
    return Math.max(view.top, header?.getBoundingClientRect().bottom || 0);
  }

  function findReadingSection(view) {
    // Expanding the mobile menu changes the sticky header's height and may
    // trigger scroll anchoring. Keep the section the guest was reading before
    // opening it, including when they use the language links inside the menu.
    if (menuToggle?.getAttribute('aria-expanded') === 'true') return readingSection;
    const top = visibleTop(view);
    // Keep the reading context while an expanded menu covers the viewport.
    if (top >= view.bottom - 1) return readingSection;
    const line = Math.min(top + 24, view.bottom - 1);
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= line && rect.bottom > line) return section.id;
    }
    return null;
  }

  function controlsVisible(view) {
    if (!panel) return false;
    const top = visibleTop(view);
    return Array.from(panel.querySelectorAll('button, a[href]')).some((control) => {
      if (!control.getClientRects().length) return false;
      const style = window.getComputedStyle(control);
      if (style.visibility === 'hidden' || style.visibility === 'collapse') return false;
      const rect = control.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, view.bottom) - Math.max(rect.top, top);
      const visibleWidth = Math.min(rect.right, view.right) - Math.max(rect.left, view.left);
      return visibleWidth > 0 && visibleHeight >= Math.min(16, rect.height / 2);
    });
  }

  function updateBar(view) {
    if (!bar) return;
    const focused = document.activeElement;
    const editing = form?.contains(focused) && focused.matches(
      'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="hidden"]), select, textarea, [contenteditable="true"]',
    );
    // Keep the last visible height while hidden. Testing against this virtual
    // bottom region avoids repeatedly showing/hiding the bar over focused links.
    const renderedHeight = bar.getBoundingClientRect().height;
    if (renderedHeight > 0) barHeight = renderedHeight;
    if (!barHeight) {
      const style = window.getComputedStyle(bar);
      const number = value => Number.parseFloat(value) || 0;
      const controlHeight = Math.max(0, ...Array.from(bar.children, control => number(window.getComputedStyle(control).minHeight)));
      barHeight = Math.max(number(style.minHeight), controlHeight + number(style.paddingTop) + number(style.paddingBottom) + number(style.borderTopWidth) + number(style.borderBottomWidth));
    }
    const focusable = focused?.matches('a[href], button, input, select, textarea, summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])');
    const rect = focusable ? focused.getBoundingClientRect() : null;
    const focusUnderBar = rect && rect.width > 0 && rect.height > 0 &&
      rect.right > view.left && rect.left < view.right &&
      rect.top < view.bottom && rect.bottom > view.bottom - barHeight;
    // Never hide the focused shortcut, including when a resize reveals the form.
    const hide = !bar.contains(focused) && (Boolean(editing) || controlsVisible(view) || Boolean(focusUnderBar));
    if (bar.hidden !== hide) bar.hidden = hide;
  }

  function update() {
    frame = 0;
    const view = viewport();
    if (isHome) {
      readingSection = findReadingSection(view);
      const active = readingSection === 'home' ? 'tentang' : navIds.has(readingSection) ? readingSection : null;
      if (currentNav !== active) {
        links.forEach((link) => {
          if (link.getAttribute('href') === `#${active}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
        currentNav = active;
      }
    }
    updateBar(view);
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  // Keep homepage reading context or a valid document anchor when changing
  // language. Unknown fragments must not be carried into another page.
  (nav ? nav.querySelectorAll('.language-links a[hreflang]') : []).forEach((link) => {
    if (link.getAttribute('aria-current') === 'page') return;
    const originalHref = link.getAttribute('href');
    const prepareLanguageLink = () => {
      let section;
      if (isHome) {
        section = findReadingSection(viewport());
        let id;
        try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { id = ''; }
        const question = id && /^faq-[a-z0-9-]+$/.test(id) ? document.getElementById(id) : null;
        // Carry only an actual FAQ answer while the guest is reading that section.
        if (section === 'faq' && question?.matches('#faqList > details[data-faq-category]')) section = id;
      }
      else {
        let id;
        try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { id = ''; }
        const target = id ? document.getElementById(id) : null;
        if (target?.matches('.document-content section[id]')) section = target.id;
      }
      const hash = section && section !== 'home' ? `#${encodeURIComponent(section)}` : '';
      link.setAttribute('href', `${originalHref.split('#')[0]}${hash}`);
    };
    link.addEventListener('click', prepareLanguageLink);
    link.addEventListener('auxclick', prepareLanguageLink);
  });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { barHeight = 0; schedule(); }, { passive: true });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', schedule, { once: true });
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  document.addEventListener('toggle', schedule, true);
  window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    [main, header, panel, bar].filter(Boolean).forEach((element) => observer.observe(element));
  }
  document.fonts?.ready.then(schedule);
  update();
})();
