"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildFamilyPlanMessage, parseEnquiryDraft } = require("../app.js");

test("family planning text includes a separate deposit and public URL without private enquiry fields", () => {
  const plan = { language: "ms", checkin: "2027-12-31", checkout: "2028-01-03", rooms: "4", roomRates: { 4: 280 }, securityDeposit: 100, publicUrl: "https://jitra2stay.vercel.app/?notes=private#semak-tarikh", guests: "19", notes: "PRIVATE FAMILY NOTE" };
  const message = buildFamilyPlanMessage(plan);
  for (const value of ["4 bilik", "2027-12-31", "2028-01-03", "3 malam", "RM840", "RM280", "Deposit keselamatan berasingan: RM100"]) assert.ok(message.includes(value), value);
  assert.ok(message.endsWith("https://jitra2stay.vercel.app/"));
  for (const value of ["PRIVATE", "19", "?notes", "#semak", "Tetamu:"]) assert.ok(!message.includes(value), value);
  assert.match(buildFamilyPlanMessage({ ...plan, language: "en" }), /Separate security deposit: RM100/);
  assert.equal(buildFamilyPlanMessage({ ...plan, checkout: plan.checkin }), null);
  assert.equal(buildFamilyPlanMessage({ ...plan, publicUrl: "javascript:alert(1)" }), null);
});

test("optional stay-length intent is strictly validated while older and correctable drafts remain compatible", () => {
  const now = Date.UTC(2027, 0, 1);
  const original = { version: 1, savedAt: now, packageChosen: false, fields: { checkin: "", checkout: "", guests: "6", rooms: "2", notes: "" } };
  const parse = draft => parseEnquiryDraft(JSON.stringify(draft), ["2"], now);
  assert.deepEqual(parse(original), original);
  assert.deepEqual(parse({ ...original, plannedNights: 3 }), { ...original, plannedNights: 3 });
  for (const value of [0, 4, -1, 2.5, "2", null, true]) assert.equal(parse({ ...original, plannedNights: value }), null);
  const invalidDates = { ...original, plannedNights: 2, fields: { ...original.fields, checkin: "2027-01-05", checkout: "2027-01-03" } };
  assert.deepEqual(parse(invalidDates), invalidDates, "restoration must not silently repair a reversed date range");
  assert.equal(parse({ ...original, plannedNights: 2, unknown: "discard" }), null);
});
