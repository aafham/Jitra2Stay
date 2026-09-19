(() => {
  'use strict';
  const controls = document.getElementById('faqControls');
  const list = document.getElementById('faqList');
  const results = document.getElementById('faqResults');
  if (!controls || !list || !results) return;
  const buttons = Array.from(controls.querySelectorAll('[data-faq-topic]'));
  const questions = Array.from(list.querySelectorAll('details[data-faq-category]'));
  if (!questions.length || !buttons.length) return;
  const en = document.documentElement.lang.startsWith('en');
  function showTopic(button) {
    const topic = button.dataset.faqTopic;
    let count = 0;
    for (const question of questions) {
      question.hidden = topic !== 'all' && question.dataset.faqCategory !== topic;
      if (!question.hidden) count++;
    }
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    results.textContent = `${count} ${en ? count === 1 ? 'question' : 'questions' : 'soalan'} · ${button.textContent.trim()}`;
  }
  buttons.forEach(button => button.addEventListener('click', () => showTopic(button)));
  showTopic(buttons.find(button => button.dataset.faqTopic === 'all') || buttons[0]);
  controls.hidden = false;

  const knownQuestions = new Map(questions.filter(question => /^faq-[a-z0-9-]+$/.test(question.id)).map(question => [question.id, question]));
  let revealFrame = 0;
  function revealHashQuestion() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const question = knownQuestions.get(id);
    if (!question) return;
    if (question.hidden) {
      const topic = buttons.find(button => button.dataset.faqTopic === question.dataset.faqCategory);
      if (topic) showTopic(topic);
    }
    question.open = true;
    if (revealFrame) cancelAnimationFrame(revealFrame);
    revealFrame = requestAnimationFrame(() => {
      revealFrame = 0;
      const summary = question.querySelector('summary');
      const headerBottom = Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0);
      // Use the actual sticky header height, including compact mobile layouts.
      const top = window.scrollY + question.getBoundingClientRect().top - headerBottom - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
      summary?.focus({ preventScroll: true });
    });
  }

  knownQuestions.forEach(question => {
    const link = question.querySelector('.faq-answer-link');
    const copyButton = question.querySelector('.faq-copy-link');
    const feedback = question.querySelector('.faq-copy-feedback');
    const fallback = question.querySelector('.faq-copy-fallback');
    if (!link || !copyButton || !feedback || !fallback) return;
    let publicUrl;
    try {
      publicUrl = new URL(link.href);
      if (publicUrl.protocol !== 'https:' || publicUrl.username || publicUrl.password || publicUrl.hash !== `#${question.id}`) return;
      publicUrl.search = '';
    } catch { return; }
    fallback.value = publicUrl.href;
    let copying = false;
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (window.location.hash === publicUrl.hash) revealHashQuestion();
      else window.location.hash = publicUrl.hash;
    });
    copyButton.addEventListener('click', async () => {
      if (copying) return;
      copying = true;
      copyButton.setAttribute('aria-busy', 'true');
      try {
        // Share only this public answer URL; enquiry data and query strings are excluded.
        await navigator.clipboard.writeText(publicUrl.href);
        fallback.hidden = true;
        feedback.textContent = en ? 'Answer link copied.' : 'Pautan jawapan disalin.';
      } catch {
        feedback.textContent = en ? 'Copy the selected answer link below.' : 'Salin pautan jawapan yang dipilih di bawah.';
        fallback.hidden = false;
        fallback.focus();
        fallback.select();
      } finally {
        copying = false;
        copyButton.removeAttribute('aria-busy');
      }
    });
    copyButton.hidden = false;
  });
  window.addEventListener('hashchange', revealHashQuestion);
  revealHashQuestion();
})();
