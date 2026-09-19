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
  const cards=Array.from(list.querySelectorAll('[data-destination-id]')).map(card=>({card,search:normalise(card.dataset.destinationSearch)}));
  const en=document.documentElement.lang.startsWith('en');
  const shortcuts=Array.from(controls.querySelectorAll('[data-destination-query]'));
  const initialCount=6;
  let expanded=false;
  function render() {
    const query=normalise(input.value);
    const terms=query.split(' ').filter(Boolean);
    shortcuts.forEach(button=>button.setAttribute('aria-pressed',String(query===normalise(button.dataset.destinationQuery))));
    const matches=cards.filter(item=>terms.every(term=>item.search.includes(term)));
    const visible=terms.length||expanded?matches:matches.slice(0,initialCount);
    const shown=new Set(visible);
    cards.forEach(item=>{item.card.hidden=!shown.has(item);});
    clear.hidden=!input.value;
    empty.hidden=matches.length>0;
    more.hidden=terms.length>0||matches.length<=initialCount;
    more.setAttribute('aria-expanded',String(expanded));
    more.textContent=expanded?(en?'Show fewer destinations':'Ringkaskan destinasi'):(en?`Show all ${cards.length} destinations`:`Lihat semua ${cards.length} destinasi`);
    results.textContent=terms.length?(en?`${matches.length} ${matches.length===1?'destination':'destinations'} found`:`${matches.length} destinasi dijumpai`):(en?`${visible.length} of ${cards.length} destinations`:`${visible.length} daripada ${cards.length} destinasi`);
  }
  input.addEventListener('input',()=>{expanded=false;render();});
  clear.addEventListener('click',()=>{input.value='';expanded=false;render();input.focus({preventScroll:true});});
  shortcuts.forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.destinationQuery;expanded=false;render();}));
  more.addEventListener('click',()=>{expanded=!expanded;render();});
  render();
  controls.hidden=false;
})();
