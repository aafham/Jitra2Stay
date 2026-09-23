'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const config=require('../site.config.cjs');
const routes=require('../destination-routes.cjs');
const {renderGuide}=require('../templates/pages.cjs');

test('UUM and Changlun guide estimates stay distinct and use the dated finder routes in both languages',()=>{
  const guide=config.guides.find(item=>item.slug==='homestay-konvokesyen-uum-jitra');
  for(const lang of ['ms','en']) {
    const html=renderGuide(guide,lang);
    for(const id of ['uum','changlun']) {
      const route=routes[id];
      assert.ok(html.includes(`≈ ${route.durationMinutes} ${lang==='ms'?'minit':'min'} (${route.distanceKm} km)`));
      assert.ok(html.includes(route.mapsUrl.replaceAll('&','&amp;')));
      assert.ok(html.includes(`<time datetime="${route.checkedAt}">`));
    }
    assert.ok(!html.includes('30 minit ke atas'));
    assert.ok(!html.includes('30 minutes or more'));
  }
});

test('all guide travel references resolve, and changing a route snapshot updates the rendered guide',()=>{
  for(const guide of config.guides) for(const lang of ['ms','en']) assert.ok(!renderGuide(guide,lang).includes('{{route:'),`${guide.slug} ${lang}`);
  const guide=config.guides.find(item=>item.slug==='tempat-menarik-sekitar-jitra');
  for(const lang of ['ms','en']) {
    const list=renderGuide(guide,lang).match(/<ul class="guide-journeys">([\s\S]*?)<\/ul>/)?.[1];
    assert.ok(list,'Around Jitra destinations are a semantic list');
    assert.equal((list.match(/<li>/g)||[]).length,10,'all ten destinations remain available');
    for(const stop of guide.journeyStops) {
      assert.ok(list.includes(`<span>${stop[lang]}</span>`));
      assert.ok(list.includes(routes[stop.id].mapsUrl.replaceAll('&','&amp;')));
    }
  }
  const original={...routes['tasik-darulaman']};
  try {
    Object.assign(routes['tasik-darulaman'],{durationMinutes:17,distanceKm:11.2,checkedAt:'2026-10-01'});
    for(const lang of ['ms','en']) {
      const html=renderGuide(guide,lang);
      assert.ok(html.includes(`≈ 17 ${lang==='ms'?'minit':'min'} (11.2 km)`));
      assert.ok(html.includes('<time datetime="2026-10-01">01/10/2026</time>'));
    }
  } finally {Object.assign(routes['tasik-darulaman'],original);}
});
