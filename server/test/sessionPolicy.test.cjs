const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isSessionVersionValid } = require('../.policy-test-build/sessionPolicy.js');

test('new account version 0 can authenticate', () => assert.equal(isSessionVersionValid(0, 0), true));
test('updated account version authenticates with current token', () => assert.equal(isSessionVersionValid(13, 13), true));
test('logout revokes earlier token version', () => assert.equal(isSessionVersionValid(12, 13), false));
test('legacy JWTs without a version are invalidated', () => assert.equal(isSessionVersionValid(undefined, 0), false));
test('string versions are rejected', () => assert.equal(isSessionVersionValid('1', 1), false));
test('negative versions are rejected', () => assert.equal(isSessionVersionValid(-1, -1), false));
test('fractional versions are rejected', () => assert.equal(isSessionVersionValid(0.5, 0.5), false));
test('missing stored version must be normalized by the server', () => assert.equal(isSessionVersionValid(0, undefined), false));
