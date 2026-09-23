// Run before styles are painted; deferred scripts take over each enhancement.
// DOMContentLoaded restores native links/photos after a failed deferred script,
// without waiting for slow images or the third-party map to finish loading.
function appearanceScript(isHome,browse=isHome) {
  return `<script>(()=>{const root=document.documentElement;${isHome?`if(matchMedia('(max-width: 900px)').matches){const routes=${JSON.stringify(require('../data/mobile-routes.cjs').sectionRoutes)},hash=location.hash.slice(1),section=hash.startsWith('faq-')?'faq':hash,key=Object.hasOwn(routes,section)?routes[section]:null;if(key){const en=root.lang==='en'||new URL(location.href).searchParams.get('lang')==='en';const next=new URL(key+(en?'-en':'')+'.html',location.href);next.search=location.search;next.searchParams.delete('lang');next.hash=location.hash;location.replace(next.href);return;}}`: ''}root.classList.add('nav-pending'${browse ? ",'gallery-pending'" : ''});let saved;try{saved=localStorage.getItem('theme')}catch{}const theme=saved==='light'||saved==='dark'?saved:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';root.dataset.theme=theme;root.style.colorScheme=theme;document.addEventListener('DOMContentLoaded',()=>root.classList.remove('nav-pending','gallery-pending'),{once:true})})();</script>`;
}

module.exports={appearanceScript};
