import test from 'node:test';
import assert from 'node:assert/strict';
import {scanEvidence} from '../lib/scan-evidence.mjs';
test('legacy evidence stays unknown; phone evidence is bounded and sanitized',()=>{
 assert.equal(scanEvidence(new URLSearchParams()),null);
 const e=scanEvidence(new URLSearchParams({evidence_version:'1',refresh_source:'object',scan_ms:'21000',refresh_ms:'8000',restarts:'0',upload_failures:'1'}));
 assert.deepEqual(e,{version:1,refresh_source:'object',scan_ms:21000,refresh_ms:8000,restarts:0,upload_failures:1});
 const invalid=scanEvidence(new URLSearchParams({evidence_version:'1',refresh_source:'secret',scan_ms:'NaN',restarts:'-1'}));
 assert.equal(invalid.refresh_source,'unknown');assert.equal(invalid.scan_ms,null);assert.equal(invalid.restarts,null);
});
