import test from 'node:test';import assert from 'node:assert/strict';import {cleanReportAudit} from '../lib/report-audit.mjs';
test('audit is bounded and cannot store arbitrary token or payload fields',()=>{
 const e={key:'report-07:candidates:0',batch:'report-07',phase:'candidates',kind:'large',at:Date.now(),window:[1,2],rows:[{id:'poi',reason:'candidate',token:'secret',lat:25}]};
 assert.equal(cleanReportAudit(e).rows[0].token,undefined);
 assert.throws(()=>cleanReportAudit({...e,rows:Array(101).fill(e.rows[0])}));
 assert.throws(()=>cleanReportAudit({...e,phase:'unauthorized'}));
 assert.throws(()=>cleanReportAudit({...e,window:[2,1]}));
});
