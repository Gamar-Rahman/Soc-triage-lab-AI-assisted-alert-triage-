const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { scoreCase, level, coverageCase, validateCase, sourceIntegrity, canDecide, buildHandoff } = require('../js/core.js');
const cases=JSON.parse(fs.readFileSync('data/scenarios.json','utf8'));
test('all six training cases valid, independently traceable',()=>{
  assert.equal(cases.length,6);
  for(const c of cases){assert.ok(validateCase(c),c.id);const i=sourceIntegrity(c);assert.equal(i.total,i.backed);assert.equal(level(scoreCase(c)),c.severity_label);}
});
test('scores computed from visible signals and separated from completeness',()=>{
  assert.deepEqual(cases.map(scoreCase),[84,68,88,61,23,78]);
  assert.deepEqual(cases.map(c=>coverageCase(c).percent),[50,75,75,75,75,75]);
});
test('missing evidence acknowledgement required for final disposition',()=>{
  const c=cases[0];assert.equal(canDecide(c,'escalate','Review privileged activity',false,[]).allowed,false);
  assert.equal(canDecide(c,'escalate','Review privileged activity',true,[]).allowed,true);
});
test('high risk cannot close without source verification',()=>{
  const c=cases[0];assert.equal(canDecide(c,'close','Known approved sign in',true,['E1']).allowed,false);
  assert.equal(canDecide(c,'close','Known approved sign in',true,['E1','E2']).allowed,true);
});
test('analyst needs narrative rationale',()=>{
  assert.equal(canDecide(cases[3],'investigate','short',false,[]).allowed,false);
  assert.equal(canDecide(cases[3],'investigate','Needs user confirmation',false,[]).allowed,true);
});
test('handoff makes claims traceable and labels synthetic',()=>{
  const x=buildHandoff(cases[0],'escalate','Evidence requires a senior analyst',['E1']);
  assert.match(x,/\[E1\]/);assert.match(x,/INFERENCE/);assert.match(x,/Endpoint telemetry/);assert.match(x,/synthetic-data/);
});
test('injection-like content cannot create unmatched citations',()=>{
  const c=structuredClone(cases[0]);c.signals[0].source_ids=['E999'];assert.equal(validateCase(c),false);
});
