const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hasCompleteAnswers, isExamSessionActive, remainingMinutes } = require('../.policy-test-build/assessmentPolicy.js');
const q = [{options:['a','b','c','d']},{options:['x','y']}];

test('valid answer choices accepted',()=>assert.equal(hasCompleteAnswers([3,1],q),true));
test('partial answer arrays rejected',()=>assert.equal(hasCompleteAnswers([1],q),false));
test('overlong answer arrays rejected',()=>assert.equal(hasCompleteAnswers([1,0,0],q),false));
test('negative and out-of-range options rejected',()=>{
  assert.equal(hasCompleteAnswers([-1,0],q),false);
  assert.equal(hasCompleteAnswers([0,2],q),false);
});
test('noninteger, missing and string answers rejected',()=>{
  assert.equal(hasCompleteAnswers([0.5,0],q),false);
  assert.equal(hasCompleteAnswers([undefined,0],q),false);
  assert.equal(hasCompleteAnswers(['1',0],q),false);
});
test('empty question bank rejected',()=>assert.equal(hasCompleteAnswers([],[]),false));
test('server-active exam accepted until deadline',()=>{
  const now=Date.now(), start=new Date(now-30000), end=new Date(now+30000);
  assert.equal(isExamSessionActive(start,end,undefined,now),true);
  assert.equal(isExamSessionActive(start,end,undefined,end.getTime()),false);
});
test('submitted and future-dated sessions rejected',()=>{
  const now=Date.now();
  assert.equal(isExamSessionActive(new Date(now-1000),new Date(now+1000),new Date(now),now),false);
  assert.equal(isExamSessionActive(new Date(now+1000),new Date(now+2000),undefined,now),false);
});
test('remaining time cannot be negative',()=>{
  const now=Date.now();
  assert.equal(remainingMinutes(new Date(now-60000),now),0);
  assert.equal(remainingMinutes(new Date(now+60000),now),1);
});
