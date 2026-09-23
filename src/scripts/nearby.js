(() => {
  'use strict';
  const list=document.getElementById('destinationsList');
  const controls=document.getElementById('destinationControls');
  const input=document.getElementById('destinationSearch');
  const clear=document.getElementById('destinationClear');
  const results=document.getElementById('destinationResults');
  const empty=document.getElementById('destinationEmpty');
  const more=document.getElementById('destinationsMore');
  if(!list||!controls||!input||!clear||!results||!empty||!more) return;
  const normalise=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const cards=Array.from(list.querySelectorAll('[data-destination-id]')).map(card=>({card,search:normalise(card.dataset.destinationSearch),categories:card.dataset.destinationCategories.split(' ')}));
  const en=document.documentElement.lang.startsWith('en');
  const categoryList=controls.querySelector('.destination-categories');
  const categories=Array.from(controls.querySelectorAll('[data-destination-category]'));
  const initialCount=6;
  let activeCategory='all';
  let expanded=false;
  function render() {
    const query=normalise(input.value);
    const terms=query.split(' ').filter(Boolean);
    categories.forEach(button=>button.setAttribute('aria-pressed',String(activeCategory===button.dataset.destinationCategory)));
    const matches=cards.filter(item=>(activeCategory==='all'||item.categories.includes(activeCategory))&&terms.every(term=>item.search.includes(term)));
    const visible=terms.length||expanded?matches:matches.slice(0,initialCount);
    const shown=new Set(visible);
    cards.forEach(item=>{item.card.hidden=!shown.has(item);});
    clear.hidden=!input.value&&activeCategory==='all';
    empty.hidden=matches.length>0;
    more.hidden=terms.length>0||matches.length<=initialCount;
    more.setAttribute('aria-expanded',String(expanded));
    more.textContent=expanded?(en?'Show fewer destinations':'Ringkaskan destinasi'):(en?`Show all ${matches.length} destinations`:`Lihat semua ${matches.length} destinasi`);
    const categoryName=categories.find(button=>button.dataset.destinationCategory===activeCategory).textContent.trim();
    const count=terms.length?(en?`${matches.length} ${matches.length===1?'destination':'destinations'} found`:`${matches.length} destinasi dijumpai`):(en?`${visible.length} of ${matches.length} destinations`:`${visible.length} daripada ${matches.length} destinasi`);
    results.textContent=`${categoryName} · ${count}`;
    empty.textContent=activeCategory==='all'
      ? (en?'No matches in this list. Try a shorter name or reset the filters.':'Tiada padanan dalam senarai ini. Cuba nama ringkas atau set semula carian.')
      : (en?'No matches in this category. Try another name, choose All or reset the filters.':'Tiada padanan dalam kategori ini. Cuba nama lain, pilih Semua atau set semula carian.');
  }
  input.addEventListener('input',()=>{expanded=false;render();});
  clear.addEventListener('click',()=>{input.value='';activeCategory='all';expanded=false;render();categoryList.scrollLeft=0;input.focus({preventScroll:true});});
  categories.forEach(button=>{
    button.addEventListener('click',()=>{activeCategory=button.dataset.destinationCategory;expanded=false;render();});
    button.addEventListener('focus',()=>{
      // Browsers may leave a partly visible focused chip clipped. Reveal it
      // within this strip without moving the surrounding page vertically.
      if(categoryList.scrollWidth<=categoryList.clientWidth) return;
      const strip=categoryList.getBoundingClientRect();
      const chip=button.getBoundingClientRect();
      if(chip.left<strip.left+3) categoryList.scrollLeft-=strip.left+3-chip.left;
      else if(chip.right>strip.right-3) categoryList.scrollLeft+=chip.right-strip.right+3;
    });
  });
  more.addEventListener('click',()=>{expanded=!expanded;render();});
  render();
  controls.hidden=false;
})();
