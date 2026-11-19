// Keep stylesheet precedence and deferred script order consistent across pages.
// Each focused page needs only the enhancements present in its HTML.
const sectionStyles = {
  gambar: ['gallery'], harga: ['rates', 'planning'], hubungi: ['planning'],
  faq: ['faq'], lokasi: ['location', 'nearby'], kalendar: ['guest-calendar'],
  kemudahan: ['gallery']
};

const sectionScripts = {
  gambar: ['gallery'], rumah: ['share'], faq: ['faq'],
  lokasi: ['location', 'nearby'], kalendar: ['guest-calendar']
};

function pageAssets(view) {
  const home = view === 'home';
  const admin = view === 'guest-admin';
  const styles = ['style', 'navigation', 'documents'];
  styles.push(...(home
    ? ['gallery', 'rates', 'planning', 'faq', 'location', 'nearby', 'guest-calendar']
    : sectionStyles[view] || []));
  styles.push('mobile', 'mobile-pages');
  if (home || view === 'kemudahan') styles.push('amenities');
  if (home || view === 'rumah') styles.push('reviews');
  if (admin) styles.push('guest-admin');
  styles.push('interaction');

  const scripts = ['app.config'];
  if (home || admin || view === 'kalendar') scripts.push('guest.config');
  scripts.push('app', 'navigation', 'mobile-pages');
  scripts.push(...(home
    ? ['gallery', 'share', 'faq', 'location', 'guest-calendar', 'nearby']
    : sectionScripts[view] || []));
  if (admin) scripts.push('guest-admin');
  return {
    styles: styles.map(name => `<link rel="stylesheet" href="${name}.css">`).join('\n'),
    scripts: scripts.map(name => `<script defer src="${name}.js"></script>`).join('\n')
  };
}

module.exports = { pageAssets };
