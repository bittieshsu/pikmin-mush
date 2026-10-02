import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { CATALOGUE_REVISION } from '../lib/catalogue-seed.mjs';
const text = readFileSync(new URL('../lib/event-spots.ts',import.meta.url),'utf8');
const js = ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const exported = {}; new Function('exports',js)(exported);
test('Nashville period renders in Central time without changing existing cities',()=>{
  const html=readFileSync(new URL('../public/event-spots.html',import.meta.url),'utf8');
  const zone = new Function('return '+html.match(/const zone=(.*?);const fmt=/)[1])();
  assert.equal(zone({country:'美國',city:'田納西州－納許維爾 Nashville'}),'America/Chicago');
  assert.equal(zone({country:'美國',city:'紐約'}),'America/New_York');
  assert.equal(zone({country:'美國',city:'西雅圖'}),'America/Los_Angeles');
});
test('Nashville adds seven exact user coordinates with distinct rewards and provenance',()=>{
  const rows=exported.EVENT_SPOT_SEED.filter(s=>s.id.startsWith('us-nashville-mini-walk-'));
  assert.equal(rows.length,7);
  assert.deepEqual(rows.map(s=>[s.lat,s.lng]),[[36.159024,-86.776504],[36.160130,-86.775742],[36.160984,-86.775365],[36.162446,-86.774053],[36.162744,-86.775954],[36.161585,-86.777866],[36.160785,-86.779836]]);
  assert.equal(new Set(rows.map(s=>s.id)).size,7);
  for(const row of rows){
    assert.equal(row.verificationStatus,'community');
    assert.match(row.coordinateNote,/使用者提供/);
    assert.match(row.cooldownNote,/14 天/);
    assert.match(row.eligibilityNote,/官方公告/);
    assert.equal(row.startAt,Date.parse('2026-10-02T00:00:00-05:00')/1000);
    assert.equal(row.endAt,Date.parse('2026-11-01T23:59:59-06:00')/1000);
  }
  assert.ok(exported.EVENT_SPOT_SEED.some(s=>s.id==='jp-nintendo-tokyo'));
  assert.ok(CATALOGUE_REVISION>2026090501);
});
