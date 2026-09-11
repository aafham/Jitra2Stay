#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'dist');
const config=require('../site.config.cjs');
const {renderHome}=require('../templates/home.cjs');
const {renderPolicies,renderGuide,renderThanks,render404}=require('../templates/pages.cjs');
const manifest=require('../images/responsive/manifest.json');
const origin=new URL(config.business.siteUrl);
if(origin.protocol!=='https:' || origin.pathname!=='/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('business.siteUrl must be a public HTTPS origin');
if(!/^\d{8,15}$/.test(config.business.phone)) throw new Error('Use international phone digits, without punctuation');
if(!Array.isArray(config.rates)||!config.rates.length||config.rates.some(r=>!Number.isInteger(r.rooms)||!Number.isFinite(r.price)||r.price<=0)) throw new Error('Invalid room rates');
// Only this exact, owned output directory is cleaned. Source images stay intact.
if(path.resolve(output)!==path.join(root,'dist')||fs.existsSync(output)&&fs.lstatSync(output).isSymbolicLink()) throw new Error('Refusing to clean an unexpected output path');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
const pages=new Map();
for(const lang of ['ms','en']) {
  const suffix=lang==='en'?'-en':'';
  pages.set(lang==='en'?'en.html':'index.html',renderHome(lang));
  pages.set(`policies${suffix}.html`,renderPolicies(lang));
  pages.set(`thank-you${suffix}.html`,renderThanks(lang));
  for(const guide of config.guides) pages.set(`${guide.slug}${suffix}.html`,renderGuide(guide,lang));
}
// Legacy Malay path still serves complete content; canonical points to the root.
pages.set('ms.html',renderHome('ms'));
pages.set('404.html',render404());
for(const [name,html] of pages) fs.writeFileSync(path.join(output,name),html+'\n');
const copy=relative=>{
  const source=path.resolve(root,relative),target=path.resolve(output,relative);
  if(!source.startsWith(root+path.sep)||!target.startsWith(output+path.sep)) throw new Error('Asset outside project');
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);
};
for(const asset of ['app.js','style.css','gallery.js','gallery.css','navigation.js','navigation.css','share.js','images/favicon.svg']) copy(asset);
const usedImages=new Set(['halaman','ruang-tamu',...config.gallery.map(p=>p.image)]);
for(const name of usedImages){
  const info=manifest.images.find(i=>i.source===`images/${name}.jpg`);
  if(!info)throw new Error(`Missing image: ${name}`);
  copy(info.source);
  for(const variant of info.variants) copy(variant.src);
}
const publicConfig={phone:config.business.phone,roomRates:Object.fromEntries(config.rates.map(r=>[r.rooms,r.price])),maxGuests:config.business.maxGuests,securityDeposit:config.business.securityDeposit,checkInTime:config.business.checkInTime,checkOutTime:config.business.checkOutTime};
fs.writeFileSync(path.join(output,'app.config.js'),`window.APP_CONFIG = ${JSON.stringify(publicConfig,null,2)};\n`);
const siteUrl=config.business.siteUrl.replace(/\/$/,'');
const indexed=[...pages.keys()].filter(name=>!['ms.html','404.html','thank-you.html','thank-you-en.html'].includes(name));
const urls=indexed.map(name=>`${siteUrl}/${name==='index.html'?'':name}`);
fs.writeFileSync(path.join(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`Built ${pages.size} complete HTML pages in dist/. Only website assets were copied.`);
