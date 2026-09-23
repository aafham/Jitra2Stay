'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { business, rates } = require('../src/data/site.config.cjs');
const { estimateStay, estimatePayment, buildEnquiryMessage, buildFamilyPlanMessage, parseEnquiryDraft } = require('../src/scripts/app.js');
const roomRates = Object.fromEntries(rates.map(rate => [rate.rooms, rate.price]));

test('initial payment adds one selected deposit to the accommodation subtotal without changing other room rates', () => {
  assert.deepEqual(roomRates, { 2: 170, 3: 230, 4: 280, 5: 330 });
  const oneNight = estimateStay('2027-01-01', '2027-01-02', '2', roomRates);
  assert.deepEqual(estimatePayment(oneNight, business.securityDeposit), { accommodation: 170, securityDeposit: 100, totalPayable: 270 });
  assert.deepEqual(estimatePayment(oneNight, business.largeGroupSecurityDeposit), { accommodation: 170, securityDeposit: 200, totalPayable: 370 });
  const twoNights = estimateStay('2027-01-01', '2027-01-03', '2', roomRates);
  assert.deepEqual(estimatePayment(twoNights, business.securityDeposit), { accommodation: 340, securityDeposit: 100, totalPayable: 440 });
  assert.equal(estimatePayment(null, 100), null);
  for (const deposit of [undefined, NaN, -1, '100']) assert.equal(estimatePayment(oneNight, deposit), null);
});

test('BM and EN enquiry and family summaries include chosen deposit, initial payment and refund terms', () => {
  for (const language of ['ms', 'en']) {
    const plan = { language, checkin: '2027-01-01', checkout: '2027-01-02', guests: '6', rooms: '2', roomRates, securityDeposit: business.largeGroupSecurityDeposit, depositCategory: 'large', publicUrl: business.siteUrl };
    const enquiry = buildEnquiryMessage({ ...plan, estimate: estimateStay(plan.checkin, plan.checkout, plan.rooms, roomRates) });
    const family = buildFamilyPlanMessage(plan);
    for (const message of [enquiry, family]) {
      for (const amount of ['RM170', 'RM200', 'RM370']) assert.ok(message.includes(amount), amount);
      assert.match(message, language === 'ms' ? /rombongan \/ majlis besar/ : /large group \/ major event/);
      assert.match(message, language === 'ms' ? /pemeriksaan rumah memuaskan/ : /satisfactory house inspection/);
      assert.match(message, language === 'ms' ? /hangus/ : /forfeited/);
    }
    assert.doesNotMatch(family, /Tetamu:|Guests:/);
  }
});

test('deposit category survives a draft while old drafts remain compatible and arbitrary categories are rejected', () => {
  const now = Date.UTC(2027, 0, 1);
  const draft = { version: 1, savedAt: now, packageChosen: false, fields: { checkin: '', checkout: '', guests: '6', rooms: '2', notes: '' } };
  const parse = value => parseEnquiryDraft(JSON.stringify(value), ['2', '3', '4', '5'], now);
  assert.deepEqual(parse(draft), draft);
  for (const depositCategory of ['standard', 'large']) assert.equal(parse({ ...draft, depositCategory }).depositCategory, depositCategory);
  for (const depositCategory of ['other', '200', 200, null, {}]) assert.equal(parse({ ...draft, depositCategory }), null);
});
