const {config,e,t,icon}=require('./shared.cjs');

function renderReviews(lang) {
  if(!config.reviews.length) return '';
  return `<section class="section wrap reviews-section" id="ulasan" aria-labelledby="reviewsTitle"><h2 id="reviewsTitle">${t(lang,'Ringkasan ulasan Google','Google review summaries')}</h2><div class="review-grid">${config.reviews.map((review,index)=>`<article class="review-card" aria-labelledby="reviewName${index}"><p class="review-name" id="reviewName${index}">${e(review.name)}</p><p class="review-summary">${e(review.summary[lang])}</p><a class="text-link review-source" href="${e(review.sourceUrl)}" target="_blank" rel="noopener noreferrer">${t(lang,'Sumber: Google Maps','Source: Google Maps')} ${icon('arrow')}</a></article>`).join('')}</div></section>`;
}

module.exports={renderReviews};
