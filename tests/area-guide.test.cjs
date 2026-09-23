'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {renderLocation}=require('../templates/location.cjs');
const config=require('../site.config.cjs');
const {e}=require('../templates/shared.cjs');

test('area groups keep all owner descriptions without competing unverified travel ranges',()=>{
  assert.equal(config.nearby.length,6);
  for(const lang of ['ms','en']) {
    const html=renderLocation(lang);
    const panel=html.slice(html.indexOf('<details class="nearby-original">'),html.indexOf('<div class="guide-links">'));
    assert.equal((panel.match(/<span class="nearby-time">/g)||[]).length,6);
    assert.doesNotMatch(panel.replace(/<[^>]*>/g,''),/\d\s*[–-]\s*\d|\d\s*(?:minit|minutes)|Approx\.|Anggaran perjalanan|journey estimates/);
    for(const group of config.nearby) {
      assert.ok(panel.includes(e(group[lang][1])),'owner group title retained');
      assert.ok(panel.includes(e(group[lang][2])),'complete owner destination description retained');
    }
    assert.ok(panel.includes(lang==='ms'?'tarikh semakan':'check date'));
    assert.ok(panel.includes(lang==='ms'?'kad laluan di atas':'route cards above'));
  }
});
