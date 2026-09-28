import test from 'node:test';
import assert from 'node:assert/strict';
import {maintenanceHealth,maintenanceMessage} from '../lib/maintenance-health.mjs';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import ts from 'typescript';

test('independent receipt prevents GitHub-only false alerts; failures escalate',()=>{
 const now=1800000000,good={lastSucceededAt:now-60,pending:0,consecutiveFailures:0,lastBatchSaturated:true};
 assert.equal(maintenanceHealth(now,good,now-4*3600,now-60).severity,'healthy');
 assert.equal(maintenanceHealth(now,good,now-60,0).severity,'healthy');
 const degraded=maintenanceHealth(now,good,now-4*3600,0);
 assert.equal(degraded.severity,'degraded');
 assert.match(maintenanceMessage(degraded,good),/清理正常/);
 for(const state of [{...good,lastSucceededAt:now-3601},{...good,consecutiveFailures:2},{...good,lastSucceededAt:0}]) {
   const result=maintenanceHealth(now,state,now,now);
   assert.equal(result.severity,'critical');assert.match(maintenanceMessage(result,state),/不能視為備援正常/);
 }
 assert.equal(maintenanceHealth(now,{...good,pending:8},now,now,now-500).severity,'healthy');
 assert.equal(maintenanceHealth(now,{...good,pending:8},now,now,now-3600).severity,'critical');
});

test('real SQL records first backlog time, resets on drain, and persists alert dedupe',async()=>{
 const sql=new DatabaseSync(':memory:');
 sql.exec(`CREATE TABLE maintenance_state(name TEXT PRIMARY KEY,last_run_at INTEGER DEFAULT 0,
   last_succeeded_at INTEGER DEFAULT 0,pending INTEGER DEFAULT 0,consecutive_failures INTEGER DEFAULT 0);
   INSERT INTO maintenance_state(name,last_succeeded_at,pending) VALUES('mushroom-retention',1800000000,10);
   INSERT INTO maintenance_state(name,last_run_at) VALUES('mushroom-retention-independent',1800000000);`);
 const db={prepare(query){return {args:[],bind(...args){this.args=args;return this},
   async first(){return sql.prepare(query).get(...this.args)},
   async all(){return {results:sql.prepare(query).all(...this.args)}},
   async run(){return {meta:sql.prepare(query).run(...this.args)}}}}};
 const source=readFileSync(new URL('../lib/cloud.ts',import.meta.url),'utf8');
 const section=source.slice(source.indexOf('export async function checkMaintenanceHealth'),source.indexOf('// GitHub\'s scheduled event'));
 const exports={};let sends=0;
 new Script(ts.transpileModule(section,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)
   .runInNewContext({exports,Date,Map,maintenanceHealth,maintenanceMessage,
     retentionStatus:r=>({lastSucceededAt:r.last_succeeded_at,pending:r.pending,consecutiveFailures:r.consecutive_failures}),
     runtime:()=>({DB:db,MAINTENANCE_DISCORD_WEBHOOK:'https://discord.com/api/webhooks/test'}),
     fetch:async()=>{sends++;return {ok:true}},AbortSignal,console,RETENTION_SCHEDULE_ALERT_REPEAT_SECONDS:86400});
 const t=1800000000000;
 assert.equal((await exports.checkMaintenanceHealth(t)).severity,'healthy');
 assert.equal(sql.prepare("SELECT last_run_at FROM maintenance_state WHERE name='mushroom-retention-backlog'").get().last_run_at,t/1000);
 sql.prepare("UPDATE maintenance_state SET last_succeeded_at=? WHERE name='mushroom-retention'").run(t/1000+3601);
 assert.equal((await exports.checkMaintenanceHealth(t+3601000)).severity,'critical');
 assert.equal(sends,1);await exports.checkMaintenanceHealth(t+3602000);assert.equal(sends,1);
 sql.exec("UPDATE maintenance_state SET pending=0 WHERE name='mushroom-retention'");
 assert.equal((await exports.checkMaintenanceHealth(t+3603000)).severity,'healthy');
 assert.equal(sql.prepare("SELECT last_run_at FROM maintenance_state WHERE name='mushroom-retention-backlog'").get().last_run_at,0);
 sql.close();
});
