"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parseEnquiryDraft, DRAFT_TTL_MS } = require("../src/scripts/app.js");
const { getPublicShareUrl } = require("../src/scripts/share.js");
const { rates, business } = require("../src/data/site.config.cjs");

const now = Date.UTC(2026, 8, 12, 3);
const roomValues = rates.map(rate => String(rate.rooms));
const draft = () => ({
  version: 1,
  savedAt: now,
  packageChosen: true,
  fields: { checkin: "2026-12-31", checkout: "2027-01-02", guests: "8", rooms: roomValues[1], notes: "Keluarga A&B + C\nIbu’s wheelchair 😊" }
});
const restore = value => parseEnquiryDraft(JSON.stringify(value), roomValues, now);

test("draft restoration keeps editable mistakes, notes and explicit package choice intact", () => {
  const value = draft();
  value.fields.checkin = "2026-01-03";
  value.fields.checkout = "2026-01-02";
  value.fields.guests = String(business.maxGuests + 1);
  assert.deepEqual(restore(value), value, "past/reversed dates and an over-capacity count must survive for correction");

  value.packageChosen = false;
  value.fields.checkout = "";
  value.fields.guests = "";
  assert.deepEqual(restore(value), value, "an incomplete form must not become an explicit package selection");
});

test("drafts expire at two hours and restoration does not renew their timestamp", () => {
  assert.equal(DRAFT_TTL_MS, 2 * 60 * 60 * 1000);
  const value = draft();
  value.savedAt = now - DRAFT_TTL_MS + 1;
  assert.equal(restore(value).savedAt, value.savedAt);
  value.savedAt = now - DRAFT_TTL_MS;
  assert.equal(restore(value), null);
  value.savedAt = now + 1;
  assert.equal(restore(value), null, "a future timestamp must not bypass expiry");
});

test("corrupt, incompatible or wrongly typed storage never becomes a restored form", () => {
  assert.equal(parseEnquiryDraft("{broken json", roomValues, now), null);
  assert.equal(restore([]), null);
  assert.equal(restore({ ...draft(), version: 2 }), null);
  const value = draft();
  value.fields.guests = 8;
  assert.equal(restore(value), null);
  assert.equal(restore({ ...draft(), extraPersonalData: "must not be carried forward" }), null);
});

test("storage rejects unsafe or oversized values while preserving ordinary text", () => {
  const value = draft();
  value.fields.notes = "x".repeat(1000);
  assert.equal(restore(value).fields.notes.length, 1000);
  value.fields.notes += "x";
  assert.equal(restore(value), null, "notes must respect the form length limit");
  value.fields.notes = "hidden\u0000control";
  assert.equal(restore(value), null);
  value.fields.notes = "<katil tambahan> & ruang keluarga";
  assert.equal(restore(value).fields.notes, value.fields.notes, "plain text is not interpreted as markup");
  value.fields.rooms = "unknown-package";
  assert.equal(restore(value), null);
  value.fields.rooms = roomValues[0];
  value.fields.checkin = "2026-02-30";
  assert.equal(restore(value), null, "an impossible calendar date is malformed storage, not an editable range mistake");
  value.fields.checkin = "2026-12-31";
  value.fields.guests = "1e999";
  assert.equal(restore(value), null);
});

test("sharing retains the public homepage language and removes all enquiry parameters and fragments", () => {
  const host = "https://jitra2stay.vercel.app";
  assert.equal(getPublicShareUrl(`${host}/?guests=8&notes=family%20details#semak-tarikh`), `${host}/`);
  assert.equal(getPublicShareUrl(`${host}/en.html?checkin=2026-12-31&notes=private#galeri`), `${host}/en.html`);
  assert.equal(getPublicShareUrl("https://aafham.github.io/Jitra2Stay/en.html?rooms=3#kadar"), "https://aafham.github.io/Jitra2Stay/en.html");
});

test("sharing refuses credentials, executable or insecure URLs, and non-homepage destinations", () => {
  for (const value of [
    "https://user:password@jitra2stay.vercel.app/",
    "javascript:alert(1)",
    "http://jitra2stay.vercel.app/",
    "https://jitra2stay.vercel.app/policies.html",
    "/en.html"
  ]) assert.equal(getPublicShareUrl(value), null, value);
});
