const {config,e,t,icon,policy,policyText,pageHref}=require('./shared.cjs');

function renderFaq(lang) {
  const topics=[{key:'all',ms:'Semua topik',en:'All topics'},...config.faqTopics];
  return `<section class="section wrap faq-layout" id="faq" aria-labelledby="faqTitle">
    <div><p class="eyebrow">${t(lang,'SEBELUM ANDA DATANG','BEFORE YOU ARRIVE')}</p><h2 id="faqTitle">${t(lang,'Ada yang ingin<br>ditanya?','A few things<br>to know.')}</h2><p>${t(lang,'Jawapan tentang rumah, tempahan dan ketibaan anda.','Answers about the house, your booking and arrival.')}</p><a class="text-link" href="${pageHref('policies',lang)}">${t(lang,'Polisi & house rules penuh','Full policies & house rules')} ${icon('arrow')}</a></div>
    <div class="faq-content"><div id="faqControls" class="faq-tools" hidden><div class="faq-filters" role="group" aria-label="${t(lang,'Pilih topik soalan','Choose a question topic')}">${topics.map(topic=>`<button class="faq-filter" type="button" data-faq-topic="${e(topic.key)}" aria-controls="faqList" aria-pressed="${topic.key==='all'}">${e(topic[lang])}</button>`).join('')}</div><p id="faqResults" class="faq-results" role="status" aria-live="polite" aria-atomic="true"></p></div>
    <div id="faqList" class="faq-list">${config.faq.map(item=>{const answer=item.policy?policy(item.policy,lang)[1]:policyText(item,lang)[1];return `<details data-faq-category="${e(item.topic)}"><summary>${e(item[lang][0])}<span aria-hidden="true">+</span></summary><p>${e(answer)}</p></details>`;}).join('')}</div></div>
  </section>`;
}
module.exports={renderFaq};
