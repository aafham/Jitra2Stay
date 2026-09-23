// Run before styles are painted; deferred scripts take over each enhancement.
// DOMContentLoaded restores native links/photos after a failed deferred script,
// without waiting for slow images or the third-party map to finish loading.
function appearanceScript(isHome) {
  return `<script>(()=>{const root=document.documentElement;root.classList.add('nav-pending'${isHome ? ",'gallery-pending'" : ''});let saved;try{saved=localStorage.getItem('theme')}catch{}const theme=saved==='light'||saved==='dark'?saved:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';root.dataset.theme=theme;root.style.colorScheme=theme;document.addEventListener('DOMContentLoaded',()=>root.classList.remove('nav-pending','gallery-pending'),{once:true})})();</script>`;
}

module.exports={appearanceScript};
