import test from 'node:test';
import assert from 'node:assert/strict';
import '../public/freshness.js';
test('unknown participants are never shown as zero and observation age is explicit',()=>{
 const f=globalThis.MushroomFreshness;
 assert.match(f.label({challenger_count:null,challenger_capacity:35,last_observed_at:100},160000),/人數未知/);
 assert.match(f.label({challenger_count:2,challenger_capacity:35,last_observed_at:100,last_verified_at:90},160000),/2\/35 人・1 分鐘前收到更新・1 分鐘前複查/);
 assert.equal(f.validCount({challenger_count:-1,challenger_capacity:35}),false);
 assert.equal(f.validCount({challenger_count:4,challenger_capacity:3}),false);
 assert.equal(f.age(0,Date.now()),'時間未知');
});
