import test from 'node:test';
import assert from 'node:assert/strict';
import { can, requirePermission, PermissionDeniedError } from '../dist/index.js';

const scope = { organizationId: 'school-a', courseId: 'course-a', ownerUserId: 'teacher-a' };
const member = (userId, role, organizationId = 'school-a', status = 'active') =>
  ({ userId, memberships: [{ userId, organizationId, role, status }] });
const entitlement = { organizationId: 'school-a', courseId: 'course-a', userId: 'learner-a', status: 'active' };

test('unknown principal or missing organization scope is denied', () => {
  assert.equal(can(null, 'courses.create', scope), false);
  assert.equal(can(member('teacher-a', 'educator'), 'courses.create', null), false);
});

test('membership from another organization is denied', () => {
  assert.equal(can(member('teacher-a', 'educator', 'school-b'), 'courses.create', scope), false);
  assert.equal(can(member('owner-b', 'owner', 'school-b'), 'billing.manage', scope), false);
});

test('invited or suspended accounts are denied', () => {
  for (const status of ['invited', 'suspended']) {
    assert.equal(can(member('teacher-a', 'educator', 'school-a', status), 'courses.create', scope), false);
  }
});

test('learners cannot author courses or manage people or billing', () => {
  for (const p of ['courses.create', 'members.invite', 'billing.manage']) {
    assert.equal(can(member('learner-a', 'learner'), p, scope), false);
  }
});

test('educators can edit or assess only their own course', () => {
  assert.equal(can(member('teacher-a', 'educator'), 'courses.edit', scope), true);
  assert.equal(can(member('teacher-b', 'educator'), 'courses.edit', scope), false);
  assert.equal(can(member('teacher-b', 'educator'), 'assessments.grade', scope), false);
  assert.equal(can(member('teacher-a', 'educator'), 'courses.publish', { organizationId: 'school-a' }), false);
});

test('organization admins manage courses but not billing', () => {
  assert.equal(can(member('admin-a', 'admin'), 'courses.delete', scope), true);
  assert.equal(can(member('admin-a', 'admin'), 'billing.manage', scope), false);
  assert.equal(can(member('owner-a', 'owner'), 'billing.manage', scope), true);
});

test('learner entitlement must be active and match learner, course and tenant', () => {
  const p = member('learner-a', 'learner');
  assert.equal(can(p, 'courses.learn', scope), false);
  assert.equal(can(p, 'courses.learn', scope, entitlement), true);
  assert.equal(can(p, 'courses.learn', scope, { ...entitlement, status: 'pending' }), false);
  assert.equal(can(p, 'courses.learn', scope, { ...entitlement, courseId: 'course-b' }), false);
  assert.equal(can(p, 'courses.learn', scope, { ...entitlement, organizationId: 'school-b' }), false);
  assert.equal(can(p, 'courses.learn', scope, { ...entitlement, userId: 'other' }), false);
});

test('forged and duplicated memberships are rejected', () => {
  const p = member('admin-a', 'owner');
  assert.equal(can({ ...p, userId: 'learner-a' }, 'billing.manage', scope), false);
  assert.equal(can({ ...p, memberships: [...p.memberships, ...p.memberships] }, 'billing.manage', scope), false);
});

test('denied access does not reveal tenant resource details', () => {
  assert.throws(() => requirePermission(member('learner-a', 'learner'), 'billing.manage', scope),
    err => err instanceof PermissionDeniedError && err.code === 'FORBIDDEN' && err.message === 'Access denied');
});
