'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {dateValue,malaysiaToday,monthGrid,occupiedDates}=require('../src/scripts/guest-calendar.js');

test('calendar dates reject rolled-over and ambiguous dates while accepting leap days',()=>{
  assert.equal(dateValue('2028-02-29').toISOString(),'2028-02-29T00:00:00.000Z');
  assert.equal(dateValue('2026-12-31').toISOString(),'2026-12-31T00:00:00.000Z');
  for(const value of ['2026-02-29','2026-04-31','2026-13-01','2026-00-10','2026-09-00','2026-9-01','23/09/2026','2026-09-23T00:00:00Z','',null,undefined,123]) {
    assert.equal(dateValue(value),null,String(value));
  }
});

test('today follows Malaysian midnight independently of the machine timezone',()=>{
  assert.equal(malaysiaToday(new Date('2026-09-22T15:59:59Z')),'2026-09-22');
  assert.equal(malaysiaToday(new Date('2026-09-22T16:00:00Z')),'2026-09-23');
  assert.equal(malaysiaToday(new Date('2026-12-31T16:00:00Z')),'2027-01-01');
});

test('month grids contain six complete Monday-first weeks including adjacent-month days',()=>{
  const september=monthGrid(2026,8);
  assert.equal(september.length,42);
  assert.equal(september[0],'2026-08-31');
  assert.equal(september.at(-1),'2026-10-11');
  assert.equal(new Set(september).size,42);
  for(let i=1;i<september.length;i++) assert.equal(+dateValue(september[i])-dateValue(september[i-1]),86400000);
  assert.equal(monthGrid(2026,5)[0],'2026-06-01','a Monday start must not add an unnecessary previous week');
  assert.equal(monthGrid(2026,10)[0],'2026-10-26','a Sunday start must include the preceding six days');
});

test('month navigation handles year boundaries and a February leap day',()=>{
  assert.deepEqual(monthGrid(2026,12),monthGrid(2027,0));
  assert.deepEqual(monthGrid(2027,-1),monthGrid(2026,11));
  assert.ok(monthGrid(2028,1).includes('2028-02-29'));
  assert.ok(!monthGrid(2027,1).includes('2027-02-29'));
});

test('occupied nights include arrival and exclude departure, allowing a same-day changeover',()=>{
  const dates=monthGrid(2026,8);
  assert.deepEqual([...occupiedDates([{check_in:'2026-09-25',check_out:'2026-09-28'}],dates)],['2026-09-25','2026-09-26','2026-09-27']);
  assert.deepEqual([...occupiedDates([
    {check_in:'2026-09-25',check_out:'2026-09-28'},
    {check_in:'2026-09-28',check_out:'2026-09-29'}
  ],dates)],['2026-09-25','2026-09-26','2026-09-27','2026-09-28']);
});

test('long and overlapping stays only mark visible nights once, including across months',()=>{
  const dates=monthGrid(2026,8);
  const occupied=occupiedDates([
    {check_in:'2026-08-01',check_out:'2026-09-02'},
    {check_in:'2026-08-31',check_out:'2026-09-03'},
    {check_in:'2026-10-10',check_out:'2026-11-01'}
  ],dates);
  assert.deepEqual([...occupied],['2026-08-31','2026-09-01','2026-09-02','2026-10-10','2026-10-11']);
  assert.equal(occupiedDates([],dates).size,0);
});

test('malformed calendar payloads fail closed instead of presenting dates as free',()=>{
  const dates=monthGrid(2026,8);
  for(const stays of [null,{},'[]',[null],[{}],[{check_in:'2026-02-29',check_out:'2026-03-02'}],[{check_in:'2026-09-26',check_out:'2026-09-26'}],[{check_in:'2026-09-28',check_out:'2026-09-26'}],Array.from({length:1001},()=>({check_in:'2026-09-25',check_out:'2026-09-26'}))]) {
    assert.throws(()=>occupiedDates(stays,dates),/Invalid/);
  }
});
