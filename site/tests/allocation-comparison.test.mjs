import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import ts from 'typescript';
import * as comparison from '../lib/allocation-comparison.mjs';
import {TARGET_HISTORY_CTE} from '../lib/target-history.mjs';

test('comparison has explicit bounded windows and does not extend future or old history',()=>{
 const now=10*86400000,epoch=now-2*86400000;
 assert.equal(comparison.comparisonWindow(new URLSearchParams(),now,epoch).hours,24);
 for(const query of ['from=1','from=1&to=2',`from=${now-1}&to=${now+3600000}`,`from=${now-10}&to=${now}`,'from=NaN&to=9'])
  assert.throws(()=>comparison.comparisonWindow(new URLSearchParams(query),now,epoch));
 assert.equal(comparison.comparisonWindow(new URLSearchParams(`from=${epoch}&to=${now}`),now,epoch).hours,48);
});

function fixture(){
 const db=new DatabaseSync(':memory:');
 db.exec(`CREATE TABLE scan_targets(id INTEGER PRIMARY KEY,country TEXT,verification_kind TEXT);
 CREATE TABLE scan_target_history(id INTEGER PRIMARY KEY,country TEXT,verification_kind TEXT);
 CREATE TABLE scan_agent_events(id INTEGER PRIMARY KEY,agent_id TEXT,target_id INTEGER,at INTEGER,event_type TEXT,duration_ms INTEGER,rows INTEGER,detail TEXT);
 CREATE TABLE mushroom_challenges(key TEXT PRIMARY KEY,identity_confidence TEXT);
 CREATE TABLE mushroom_observations(challenge_key TEXT,agent_id TEXT,target_id INTEGER,received_at INTEGER,level INTEGER,challenger_count INTEGER,challenger_capacity INTEGER,finish_ms INTEGER);`);
 const event=(id,agent,target,at=2000000,kind='target_completed')=>db.prepare('INSERT INTO scan_agent_events VALUES(?,?,?,?,?,?,?,?)').run(id,agent,target,at,kind,10000,1,JSON.stringify({evidence:{version:1,restarts:0,upload_failures:0}}));
 for(const [id,country,kind] of [[1,'A',''],[2,'B',''],[3,'A','candidate'],[4,'A',''],[5,'A',''],[6,'B',''],[7,'B','return']])db.prepare('INSERT INTO scan_targets VALUES(?,?,?)').run(id,country,kind);
 db.prepare('INSERT INTO scan_target_history VALUES(?,?,?)').run(1,'A',''); // no double join
 db.prepare('INSERT INTO scan_target_history VALUES(?,?,?)').run(8,'C',''); // archived-only survives
 event(1,'leo',1);event(2,'leo',1);event(3,'leo',2);event(4,'leo',3);event(5,'cancer',4);
 event(6,'leo',5,2000000,'target_failed');event(7,'leo',6,3000000);event(8,'leo',7);event(9,'leo',8);
 for(const key of ['same','giant','full','expired','wrong-agent','unresolved','failed','future','return','orphan','outside-attempt'])db.prepare('INSERT INTO mushroom_challenges VALUES(?,?)').run(key,key==='unresolved'?'unresolved':'challenge_start');
 const obs=(key,target,agent='leo',level=3,count=2,finish=0,received=1995)=>db.prepare('INSERT INTO mushroom_observations VALUES(?,?,?,?,?,?,?,?)').run(key,agent,target,received,level,count,35,finish);
 obs('same',1);obs('same',1);obs('same',2);obs('giant',8,'leo',4);obs('full',1,'leo',3,5);obs('expired',1,'leo',3,0,1994000);
 obs('wrong-agent',1,'cancer');obs('unresolved',1);obs('failed',5);obs('future',6,'leo',3,0,0,2995);obs('return',7);
 obs('orphan',999);obs('outside-attempt',1,'leo',3,1,0,1900);obs('same',3);obs('same',4,'cancer');
 const adapter={prepare(sql){let values=[];return {bind(...args){values=args;return this},async all(){return {results:db.prepare(sql).all(Object.fromEntries(values.map((v,i)=>[String(i+1),v])))}}}}};
 return {db,adapter};
}

test('real SQLite comparison excludes rechecks, repeats, invalid receipts and unresolved identities',async()=>{
 const {db,adapter}=fixture();
 const result=await comparison.buildAllocationComparison(adapter,{from:1000000,to:3000000,hours:2});
 const leo=result.agents.find(r=>r.agent_id==='leo');
 assert.equal(leo.targets,4);assert.equal(leo.completed_targets,3);assert.equal(leo.failed_targets,1);
 assert.equal(leo.eligible_unique,2);assert.equal(leo.eligible_large,1);assert.equal(leo.eligible_giant,1);assert.equal(leo.unresolved_unique,1);
 assert.equal(leo.eligible_per_wall_hour,1);assert.equal(leo.success_rate,0.75);
 assert.equal(result.regions.filter(r=>r.agent_id==='leo').reduce((n,r)=>n+r.eligible_unique,0),3);
 assert.equal(result.agents.find(r=>r.agent_id==='cancer').eligible_unique,1);
 assert.equal(result.activation_ready,false);db.close();
});

test('actual comparison route rejects anonymous and malformed queries without weakening admin writes',async()=>{
 let authorized=false,called=0;const now=Date.now();const exports={};
 const db={prepare(){return {bind(){return this},async run(){},async first(){return {last_run_at:now-3*86400000}}}}};
 new Script(ts.transpileModule(readFileSync(new URL('../app/api/admin/allocation-shadow/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText).runInNewContext({exports,URL,Date,Map,Set,require(p){
  if(p.endsWith('/cloud'))return {adminAuthorized:()=>false,controllerAuthorized:()=>authorized,ensureSchema:async()=>{},runtime:()=>({DB:db}),noStoreJson:(body,status=200)=>Response.json(body,{status})};
  if(p.endsWith('/allocation-comparison.mjs'))return {...comparison,buildAllocationComparison:async(_,w)=>{called++;return {window_start:w.from,window_end:w.to,activation_ready:false}}};
  if(p.endsWith('/target-history.mjs'))return {TARGET_HISTORY_CTE};return {};
 }});
 assert.equal((await exports.GET(new Request('https://example.test/?view=comparison'))).status,403);
 authorized=true;assert.equal((await exports.GET(new Request('https://example.test/?view=comparison&from=1'))).status,400);assert.equal(called,0);
 const response=await exports.GET(new Request(`https://example.test/?view=comparison&from=${now-86400000}&to=${now}`));
 assert.equal(response.status,200);assert.equal(called,1);assert.equal((await response.json()).activation_ready,false);
});
