/**
 * iremehub+ organization authorization policy (Phase 1 foundation).
 * PURE DOMAIN LOGIC: does not authenticate users or load database records.
 * Backend must resolve memberships and entitlements server-side.
 */
export type OrganizationRole = 'owner' | 'admin' | 'educator' | 'learner';
export type MembershipStatus = 'invited' | 'active' | 'suspended';
export type Permission =
  | 'organization.manage'
  | 'members.invite'
  | 'members.manage'
  | 'billing.manage'
  | 'courses.create'
  | 'courses.edit'
  | 'courses.publish'
  | 'courses.delete'
  | 'courses.learn'
  | 'enrollments.manage'
  | 'assessments.grade'
  | 'analytics.view';

export interface OrganizationMembership {
  readonly organizationId: string;
  readonly userId: string;
  readonly role: OrganizationRole;
  readonly status: MembershipStatus;
}

export interface Principal {
  readonly userId: string;
  /** Must be populated from trusted server-side persistence. */
  readonly memberships: readonly OrganizationMembership[];
}

export interface ResourceScope {
  readonly organizationId: string;
  readonly courseId?: string;
  readonly ownerUserId?: string;
}

export interface CourseEntitlement {
  readonly userId: string;
  readonly organizationId: string;
  readonly courseId: string;
  readonly status: 'active' | 'pending' | 'revoked';
}

const ROLE_PERMISSIONS: Readonly<Record<OrganizationRole, ReadonlySet<Permission>>> = {
  owner: new Set([
    'organization.manage', 'members.invite', 'members.manage', 'billing.manage',
    'courses.create', 'courses.edit', 'courses.publish', 'courses.delete',
    'enrollments.manage', 'assessments.grade', 'analytics.view'
  ]),
  admin: new Set([
    'members.invite', 'members.manage', 'courses.create', 'courses.edit',
    'courses.publish', 'courses.delete', 'enrollments.manage',
    'assessments.grade', 'analytics.view'
  ]),
  educator: new Set([
    'courses.create', 'courses.edit', 'courses.publish',
    'enrollments.manage', 'assessments.grade', 'analytics.view'
  ]),
  learner: new Set(['courses.learn'])
};

const OWNED_COURSE_PERMISSIONS: ReadonlySet<Permission> = new Set([
  'courses.edit', 'courses.publish', 'enrollments.manage',
  'assessments.grade'
]);

/** Fail closed for missing scope, inactive membership, ownership or entitlement. */
export function can(
  principal: Principal | null | undefined,
  permission: Permission,
  resource: ResourceScope | null | undefined,
  entitlement?: CourseEntitlement | null
): boolean {
  if (!principal?.userId || !resource?.organizationId) return false;
  const matching = principal.memberships.filter(
    membership => membership.userId === principal.userId
      && membership.organizationId === resource.organizationId
      && membership.status === 'active'
  );
  const membership = matching[0];
  if (matching.length !== 1 || !membership) return false;
  if (!ROLE_PERMISSIONS[membership.role]?.has(permission)) return false;

  if (permission === 'courses.learn') {
    return Boolean(
      resource.courseId
      && entitlement?.status === 'active'
      && entitlement.userId === principal.userId
      && entitlement.organizationId === resource.organizationId
      && entitlement.courseId === resource.courseId
    );
  }
  if (membership.role === 'educator' && OWNED_COURSE_PERMISSIONS.has(permission)) {
    return Boolean(resource.courseId && resource.ownerUserId === principal.userId);
  }
  return true;
}

export class PermissionDeniedError extends Error {
  readonly code = 'FORBIDDEN';
  constructor() {
    super('Access denied');
    this.name = 'PermissionDeniedError';
  }
}

export function requirePermission(
  principal: Principal | null | undefined,
  permission: Permission,
  resource: ResourceScope | null | undefined,
  entitlement?: CourseEntitlement | null
): void {
  if (!can(principal, permission, resource, entitlement)) throw new PermissionDeniedError();
}
