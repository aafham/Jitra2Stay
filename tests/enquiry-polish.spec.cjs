'use strict';
const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;

function luminance(cssColor) {
  const channels=cssColor.match(/[\d.]+/g).slice(0,3).map(Number).map(value=>{
    const channel=value/255;
    return channel<=0.04045?channel/12.92:((channel+0.055)/1.055)**2.4;
  });
  return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;
}
function contrast(first,second) {
  const a=luminance(first),b=luminance(second);
  return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
}

for(const [lang,theme,width] of [['ms','light',390],['ms','dark',1440],['en','light',1440],['en','dark',390]]) {
  test(`${lang} ${theme} focused enquiry titles remain readable on their different backgrounds`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.emulateMedia({colorScheme:theme,reducedMotion:'reduce'});
    await page.goto(lang==='en'?'/hubungi-en.html':'/hubungi.html');
    await expect(page.locator('#dateForm')).toBeVisible();
    await expect(page.locator('#enquiryTitle')).toHaveJSProperty('tagName','H1');
    await expect(page.locator('#enquiryFormTitle')).toHaveJSProperty('tagName','H2');
    const colors=await page.evaluate(()=>{
      const color=selector=>getComputedStyle(document.querySelector(selector)).color;
      const background=selector=>getComputedStyle(document.querySelector(selector)).backgroundColor;
      return {intro:color('#enquiryTitle'),backdrop:background('#semak-tarikh'),form:color('#enquiryFormTitle'),panel:background('.enquiry-panel')};
    });
    // The intro is over a dark photo/fallback, while the form is an opaque
    // themed surface. A broad h2 rule must not give both headings white text.
    expect(contrast(colors.intro,colors.backdrop)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.form,colors.panel)).toBeGreaterThanOrEqual(4.5);
    expect((await new AxeBuilder({page}).include('.enquiry-panel').analyze()).violations).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  });
}
