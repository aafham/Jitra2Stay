"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parseDateOnly, addDays, nightsBetween, estimateStay, buildEnquiryMessage, getEnquiryUrl } = require("../src/scripts/app.js");

test("calendar dates reject impossible dates instead of silently rolling into another month", () => {
  for (const value of ["", "2026-02-29", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00", "2026-1-02", "2026-01-02T00:00:00Z", null, undefined]) {
    assert.equal(parseDateOnly(value), null, String(value));
  }
  assert.equal(typeof parseDateOnly("2028-02-29"), "number");
});

test("checkout crosses month, leap-day and year boundaries safely", () => {
  assert.equal(addDays("2026-09-30", 1), "2026-10-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(addDays("2028-02-29", 1), "2028-03-01");
  assert.equal(addDays("2026-02-29", 1), null);
});

test("a night is a calendar day including DST transitions; checkout must be later", () => {
  assert.equal(nightsBetween("2026-03-07", "2026-03-10"), 3);
  assert.equal(nightsBetween("2026-10-31", "2026-11-02"), 2);
  assert.equal(nightsBetween("2026-12-31", "2027-01-02"), 2);
  assert.equal(nightsBetween("2026-10-01", "2026-10-01"), null);
  assert.equal(nightsBetween("2026-10-02", "2026-10-01"), null);
});

test("estimates use the selected room rate and cannot produce totals for bad selections", () => {
  const rates = { 2: 170, 3: 200, 4: 220 };
  assert.deepEqual(estimateStay("2026-12-31", "2027-01-02", "3", rates), { nights: 2, nightlyRate: 200, total: 400 });
  for (const roomCount of [0, 1, 5, "bad", "3.5"]) {
    assert.equal(estimateStay("2026-12-31", "2027-01-02", roomCount, rates), null);
  }
  assert.equal(estimateStay("2026-10-01", "2026-10-01", "3", rates), null);
});

test("WhatsApp preserves line breaks, Malay characters and guest punctuation without adding URL parameters", () => {
  const notes = "A&B + C? #keluarga / ibu’s wheelchair 😊";
  for (const language of ["ms", "en"]) {
    const message = buildEnquiryMessage({ language, checkin: "2026-12-31", checkout: "2027-01-02", guests: 7, rooms: 3, notes, estimate: { nights: 2, nightlyRate: 200, total: 400 } });
    assert.ok(message.includes(notes));
    assert.ok(message.includes("2026-12-31"));
    assert.ok(message.includes("2027-01-02"));
    assert.ok(message.includes("400"));
    assert.ok(message.includes("\n"));
    const url = new URL(getEnquiryUrl("60194410666", message));
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.pathname, "/60194410666");
    assert.equal(url.searchParams.get("text"), message);
    assert.deepEqual([...url.searchParams.keys()], ["text"]);
    assert.equal(url.hash, "");
  }
});
