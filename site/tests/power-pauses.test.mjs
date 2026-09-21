import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';

function load(path,deps){
  const exports={};
  new Script(ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
  }).outputText).runInNewContext({exports,URL,require(name){
    for(const [suffix,value] of Object.entries(deps))if(name.endsWith(suffix))return value;
    throw Error(name);
  }});
  return exports;
}
const db=new DatabaseSync(':memory:');
db.exec(readFileSync(new URL('../drizzle/0020_romantic_namor.sql',import.meta.url),'utf8'));
db.exec('CREATE TABLE scan_agents(id TEXT,name TEXT);');
const cloud={runtime:()=>({DB:{prepare(sql){return {bind(...args){return {
  async run(){return db.prepare(sql).run(...args);},
  async all(){return {results:db.prepare(sql).all(...args)};}
};}};}}}),noStoreJson:(body,status=200)=>Response.json(body,{status}),
  readBoundedUtf8:async req=>({text:await req.text()})};
const powers=load('../lib/power-pauses.ts',{'/cloud':cloud});
const now=Date.now();
const event={id:'pause-123456',paused_at:now-3600000,resumed_at:null,reason:'low-battery'};

test('strict time/reason validation',()=>{
  assert.ok(powers.parsePowerPause(event,now));
  for(const bad of [{id:'../x'},{reason:'invalid'},{paused_at:now+600000},{resumed_at:0},{resumed_at:undefined}])
    assert.equal(powers.parsePowerPause({...event,...bad},now),null);
});
test('durable interval is idempotent and late open packet cannot reopen; window overlaps',async()=>{
  await powers.savePowerPause('cancer',event);
  await powers.savePowerPause('cancer',{...event,resumed_at:now-1000});
  await powers.savePowerPause('cancer',event);
  let history=await powers.powerPauseHistory(now-2000,now);
  assert.equal(history.pauses.length,1);
  assert.equal(history.pauses[0].resumed_at,now-1000);
  assert.equal((await powers.powerPauseHistory(now,now+1000)).pauses.length,0);
  await powers.savePowerPause('other',event);
  assert.equal((await powers.powerPauseHistory(now,now+1000)).pauses.length,1);
});
test('routes reject anonymous access and bind write identity to agent token',async()=>{
  let identity=null,saved;
  const route=load('../app/api/agent/power-events/route.ts',{
    '/cloud':cloud,'/fleet':{authorizeFleetAgent:async()=>identity},
    '/power-pauses':{...powers,savePowerPause:async(id,e)=>{saved={id,e};}}
  });
  const request=()=>new Request('https://example.test',{method:'POST',body:JSON.stringify({...event,agent_id:'victim'})});
  assert.equal((await route.POST(request())).status,401);
  identity={id:'own'};
  assert.equal((await route.POST(request())).status,200);
  assert.equal(saved.id,'own');
  const admin=load('../app/api/admin/power-events/route.ts',{
    '/cloud':{...cloud,adminAuthorized:()=>false,controllerAuthorized:()=>false},'/power-pauses':powers
  });
  assert.equal((await admin.GET(new Request('https://example.test'))).status,403);
});
