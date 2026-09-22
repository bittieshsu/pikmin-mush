import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const context={URLSearchParams,Date,fetch};
runInNewContext(readFileSync(new URL('../public/map-queries.js',import.meta.url),'utf8'), context);
const q=context.MushroomQueries;

test('map and world list share server filters without a global result cap',()=>{
 const params=q.filterParams({levels:[4,3],underFiveOnly:true,recentHours:6,q:'city'},new Set(['ice','2']),'discovered-desc',true,1000);
 assert.equal(params.get('levels'),'3,4'); assert.equal(params.get('types'),'2,ice');
 assert.equal(params.get('under_five'),'1'); assert.equal(params.get('discovered_within_hours'),'6');
 assert.equal(params.get('cache'),'brief'); assert.equal(params.has('bbox'),false);assert.equal(params.has('_'),false);
});

test('bbox quantization covers edges, antimeridian, repeated worlds and nearby pans',()=>{
 assert.equal(q.quantizedBbox([10.011,20.011,10.031,20.031]),q.quantizedBbox([10.012,20.012,10.032,20.032]));
 assert.equal(q.quantizedBbox([-190,-90,190,90]),'-180.00000,-90.00000,180.00000,90.00000');
 const wrapped=q.quantizedBbox([179.91,-10,180.11,10]).split(',').map(Number);
 assert.ok(wrapped[0]>wrapped[2]); assert.ok(wrapped[0]<=179.91);assert.ok(wrapped[2]>=-179.89);
});

test('auto list refresh is once a minute and never recrawls deep/hidden/busy lists',()=>{
 const state={hidden:false,busy:false,rows:1000,pageSize:1000,lastUpdated:0,now:60000};
 assert.equal(q.shouldRefreshList(state),true);
 for(const change of [{now:20000},{rows:1001},{hidden:true},{busy:true}])assert.equal(q.shouldRefreshList({...state,...change}),false);
});

test('429/503 backs off all map/list reads and cursor expiration is distinguishable',async()=>{
 let now=0,calls=0;
 const read=q.createFetcher(async()=>{calls++;return new Response('{}',{status:429,headers:{'Retry-After':'30'}})},()=>now);
 await assert.rejects(read(new URLSearchParams()),{name:'RetryLaterError'});
 now=20000;await assert.rejects(read(new URLSearchParams()),{name:'RetryLaterError'});assert.equal(calls,1);
 now=30000;await assert.rejects(read(new URLSearchParams()),{name:'RetryLaterError'});assert.equal(calls,2);
 const expired=q.createFetcher(async()=>new Response('{}',{status:410}));
 await assert.rejects(expired(new URLSearchParams()),{name:'CursorExpiredError'});
});
