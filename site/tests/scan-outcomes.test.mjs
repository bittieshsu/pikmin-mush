import assert from "node:assert/strict";
import test from "node:test";
import { classifyScanOutcome as classify } from "../lib/scan-outcomes.mjs";
test("zero rows never silently becomes an empty or duplicate scan",()=>{
  assert.equal(classify({ok:true,rows:0}),"zero_unclassified");
  assert.equal(classify({ok:true,rows:3}),"captured");
  assert.equal(classify({ok:false,rows:0,outcome:"empty"}),"failed_unclassified");
  assert.equal(classify({ok:false,rows:0,outcome:"upload_failed"}),"upload_failed");
  assert.equal(classify({ok:true,rows:0,outcome:"duplicate"}),"duplicate");
});
