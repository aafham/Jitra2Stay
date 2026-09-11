/* Progressive homepage navigation. Load with defer after app.js.
 * Existing anchors and the menu work independently of this enhancement.
 * ResizeObserver catches gallery/filter height changes; no custom events or
 * stored language, form, guest, or note values are required.
 */
(() => {
  'use strict';

  const main = document.getElementById('mainContent');
  const home = document.getElementById('home');
  const nav = document.getElementById('mainNav');
  if (!main || !home || home.parentElement !== main || !nav) return;

  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menuToggle');
  const bar = document.querySelector('.mobile-action-bar');
  const panel = main.querySelector('.enquiry-panel');
  const form = document.getElementById('dateForm');
  const navIds = new Set(['tentang', 'galeri', 'kadar', 'kemudahan', 'lokasi']);
  const sectionIds = new Set(['home', ...navIds, 'faq', 'semak-tarikh']);
  const sections = Array.from(main.children).filter((element) =>
    element.tagName === 'SECTION' && sectionIds.has(element.id));
  const links = Array.from(nav.children).filter((element) =>
    element.tagName === 'A' && navIds.has(element.getAttribute('href')?.slice(1)) &&
    element.getAttribute('href').startsWith('#'));
  let currentNav;
  let readingSection = 'home';
  let frame = 0;

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
    // Never hide the focused shortcut, including when a resize reveals the form.
    const hide = !bar.contains(focused) && (Boolean(editing) || controlsVisible(view));
    if (bar.hidden !== hide) bar.hidden = hide;
  }

  function update() {
    frame = 0;
    const view = viewport();
    readingSection = findReadingSection(view);
    const active = readingSection === 'home' ? 'tentang' : navIds.has(readingSection) ? readingSection : null;
    if (currentNav !== active) {
      links.forEach((link) => {
        if (link.getAttribute('href') === `#${active}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      currentNav = active;
    }
    updateBar(view);
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  // Rewrite only the alternate homepage-language link, just before its normal
  // navigation. Hero switches retain the original hash-free round trip.
  nav.querySelectorAll('.language-links a[hreflang]').forEach((link) => {
    if (link.getAttribute('aria-current') === 'page') return;
    const originalHref = link.getAttribute('href');
    const prepareLanguageLink = () => {
      const section = findReadingSection(viewport());
      const hash = section && section !== 'home' ? `#${section}` : '';
      link.setAttribute('href', `${originalHref.split('#')[0]}${hash}`);
    };
    link.addEventListener('click', prepareLanguageLink);
    link.addEventListener('auxclick', prepareLanguageLink);
  });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
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
    [main, header, panel].filter(Boolean).forEach((element) => observer.observe(element));
  }
  document.fonts?.ready.then(schedule);
  update();
})();
