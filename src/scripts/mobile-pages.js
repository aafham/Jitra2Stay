(() => {
  'use strict';
  const mobile=matchMedia('(max-width: 900px)');
  const en=document.documentElement.lang==='en';
  const view=document.body.dataset.view;
  const routes={tentang:'rumah',galeri:'gambar',kadar:'harga',kalendar:'kalendar',kemudahan:'kemudahan',lokasi:'lokasi',faq:'faq','semak-tarikh':'hubungi'};
  const originals=new Map();
  let barHeight=84;
  const page=key=>`${key}${en?'-en':''}.html`;
  const routeFor=hash=>{
    const section=hash.startsWith('faq-')?'faq':hash;
    return Object.hasOwn(routes,section)?routes[section]:null;
  };
  function syncLinks(){
    for(const anchor of document.querySelectorAll('a[href]')){
      const raw=originals.get(anchor)||anchor.getAttribute('href');
      // Only local homepage anchors are remapped; external links remain intact.
      const match=/^(?:(?:\.\/)?(?:index|ms|en)\.html|\.\/)?#([\w-]+)$/.exec(raw);
      if(!match)continue;
      const hash=match[1],key=routeFor(hash);
      if(!key)continue;
      const local=raw.startsWith('#');
      if(local&&view!=='home')continue;
      originals.set(anchor,raw);
      anchor.setAttribute('href',mobile.matches?page(key)+(hash.startsWith('faq-')?`#${hash}`:''):raw);
    }
  }
  function syncLanguage(){
    document.querySelectorAll('.mobile-language a').forEach(anchor=>{
      const target=new URL(anchor.getAttribute('href'),location.href);
      target.hash=view!=='home'&&document.getElementById(location.hash.slice(1))?location.hash:'';
      anchor.href=target.href;
    });
  }
  function keyboard(){
    const active=document.activeElement;
    const bar=document.querySelector('.mobile-bottom-nav');
    const rendered=bar?.getBoundingClientRect().height;
    if(rendered>0){
      barHeight=rendered;
      document.documentElement.style.setProperty('--mobile-nav-height',`${Math.ceil(rendered)}px`);
    }
    const editable=Boolean(active?.matches('input,select,textarea,[contenteditable="true"]'));
    const bounds=active?.getBoundingClientRect();
    // Revealing a fixed bar on input blur must not cover the next link during
    // pointerup, or obscure a link reached by keyboard navigation.
    const covered=active!==document.body && !bar?.contains(active) && bounds?.height>0 && bounds.bottom>innerHeight-barHeight && bounds.top<innerHeight;
    document.body.classList.toggle('mobile-keyboard',mobile.matches&&(editable||covered));
  }
  function legacyHash(){
    if(view!=='home'||!mobile.matches)return;
    const hash=location.hash.slice(1),key=routeFor(hash);
    if(key)location.replace(new URL(page(key)+location.search+location.hash,location.href));
  }
  syncLinks();syncLanguage();keyboard();
  mobile.addEventListener('change',()=>{syncLinks();keyboard();legacyHash()});
  window.addEventListener('hashchange',()=>{syncLanguage();legacyHash()});
  document.addEventListener('focusin',event=>{
    keyboard();
    if(event.target.matches('.gallery-filter')){
      const strip=event.target.closest('.gallery-filters');
      if(strip&&strip.scrollWidth>strip.clientWidth){
        const area=strip.getBoundingClientRect(),item=event.target.getBoundingClientRect();
        if(item.right>area.right-6)strip.scrollLeft+=item.right-area.right+6;
        else if(item.left<area.left+6)strip.scrollLeft+=item.left-area.left-6;
      }
    }
  });
  document.addEventListener('focusout',()=>queueMicrotask(keyboard));
  window.addEventListener('scroll',keyboard,{passive:true});
  window.addEventListener('resize',keyboard);
  window.addEventListener('pageshow',()=>{syncLinks();syncLanguage();keyboard()});
})();
