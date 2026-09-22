import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from './helpers/mushroom-api.mjs';

test('every API path is bounded and all 2305 world results remain reachable without duplicates',async()=>{
 const api=createApi();
 try{
  const initial=await (await api.get()).json();
  assert.equal(initial.returned,500);assert.equal(initial.count,2305);assert.equal(initial.pagination.mode,'cursor');
  assert.equal((await (await api.get('limit=100000')).json()).returned,1000);
  const rows=[],params=new URLSearchParams({limit:'1000'});let data;
  do{
   data=await (await api.get(params)).json();rows.push(...data.mushrooms);
   assert.ok(data.returned<=1000);
   if(data.pagination.has_more){params.set('cursor',data.pagination.next_cursor);params.set('include_meta','0')}
  }while(data.pagination.has_more);
  assert.equal(rows.length,2305);assert.equal(new Set(rows.map(r=>r.id)).size,2305);
  assert.ok(rows.some(r=>r.lng<0)&&rows.some(r=>r.lng>0));
  assert.ok(rows.every(r=>r.discovered_by==='Fixture Agent'));
  assert.equal(data.count,null);assert.equal(data.live_agents,undefined);
 }finally{api.db.close()}
});

test('continuation pages skip count and reuse fleet metadata; invalid input performs no SQL',async()=>{
 const api=createApi({size:25});
 try{
  for(const params of ['bbox=bad','levels=1','limit=abc','include_meta=bad','cursor=bad',
    'types='+Array.from({length:41},(_,i)=>i).join(',')]) {
   assert.equal((await api.get(params)).status,400);
  }
  assert.equal(api.statements.length,0);
  const first=await (await api.get('limit=5')).json();
  assert.equal(api.statements.length,5);
  const params=new URLSearchParams({limit:'5',include_meta:'0',cursor:first.pagination.next_cursor});
  assert.equal((await api.get(params)).status,200);
  assert.equal(api.statements.length,6);
  await api.get('limit=5');assert.equal(api.statements.length,7); // cached count + metadata
  api.advance(16000);await api.get('limit=5');assert.equal(api.statements.length,12);
 }finally{api.db.close()}
});

test('scoped cursors preserve filters, ordering and expiry; default notifier reads see new participant data',async()=>{
 const api=createApi({size:25});
 try{
  const params=new URLSearchParams({limit:'5',levels:'3',types:'12,2',sort:'discovered-desc',under_five:'1',discovered_within_hours:'6'});
  const first=await (await api.get(params)).json();
  assert.equal(first.count,21);assert.ok(first.mushrooms.every(r=>r.challenger_count<5));
  params.set('cursor',first.pagination.next_cursor);params.set('types','2,12');
  assert.equal((await api.get(params)).status,200); // order-independent scope for cache keys
  params.set('under_five','0');assert.equal((await api.get(params)).status,400);
  params.set('under_five','1');api.advance(3600001);assert.equal((await api.get(params)).status,410);
  api.db.prepare('UPDATE mushrooms SET challenger_count=5 WHERE id=?').run(first.mushrooms[0].id);
  const changed=await (await api.get('limit=1000')).json();
  assert.equal(changed.mushrooms.find(r=>r.id===first.mushrooms[0].id).challenger_count,5);
 }finally{api.db.close()}
});
