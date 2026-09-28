import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{runMaintenance} from './index.mjs';

function setup(){
 const state=new Map();return {MAINTENANCE_TOKEN:'x'.repeat(32),DISCORD_WEBHOOK:'https://discord.com/api/webhooks/test',
 ALERT_STATE:{get:async k=>state.get(k),put:async(k,v)=>state.set(k,v)}};
}
test('cron calls only fixed HTTPS endpoint with dedicated secret and source receipt',async()=>{
 const env=setup(),now=1800000000000;
 await runMaintenance(env,{now,fetch:async(url,options)=>{
   assert.equal(url,'https://mush.odyliao.cc/api/controller/maintenance');assert.equal(options.redirect,'error');
   assert.equal(options.headers['x-maintenance-event'],'cloudflare-cron');
   assert.equal(options.headers.authorization,`Bearer ${env.MAINTENANCE_TOKEN}`);
   return Response.json({retention:{lastSucceededAt:now/1000,pending:0},maintenanceHealth:{independentLastSucceededAt:now/1000,severity:'healthy'}});
 }});
 assert.equal(worker.fetch().status,404);
});

test('network errors never leak credentials and failed Discord delivery is retried next run',async()=>{
 const env=setup(),now=1800000000000;let sends=0;
 const request=async url=>{if(url===env.DISCORD_WEBHOOK){sends++;return new Response('',{status:sends===1?500:200})}
   throw Error('private remote details')};
 await assert.rejects(runMaintenance(env,{now,fetch:request}),/Independent maintenance did not receive/);
 await assert.rejects(runMaintenance(env,{now:now+900000,fetch:request}));assert.equal(sends,2);
 await assert.rejects(runMaintenance(env,{now:now+1800000,fetch:request}));assert.equal(sends,2);
});
test('stale receipts and network failures retry boundedly and dedupe delivery persistently',async()=>{
 const env=setup(),now=1800000000000;let calls=0,sends=0;
 const request=async url=>{if(url===env.DISCORD_WEBHOOK){sends++;return new Response('',{status:200})}
   calls++;return Response.json({retention:{lastSucceededAt:now/1000-400},maintenanceHealth:{}})};
 await assert.rejects(runMaintenance(env,{now,fetch:request}));assert.equal(calls,2);assert.equal(sends,1);
 await assert.rejects(runMaintenance(env,{now:now+900000,fetch:request}));assert.equal(calls,4);assert.equal(sends,1);
 await assert.rejects(runMaintenance(env,{now:now+86401000,fetch:request}));assert.equal(sends,2);
});
