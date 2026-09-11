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
})();
