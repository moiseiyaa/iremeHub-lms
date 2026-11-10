/** Pure authorization checks using trusted server-side records. */
export interface LessonAccess {
  published: boolean;
  enrolled: boolean;
  instructor: boolean;
  admin: boolean;
  preview?: boolean;
}
export function canListLessons(access: LessonAccess): boolean {
  return access.instructor || access.admin || (access.published && access.enrolled);
}
export function canReadLesson(access: LessonAccess): boolean {
  return access.instructor || access.admin ||
    (access.published && (access.enrolled || access.preview === true));
}
export interface EnrollmentApproval {
  published: boolean;
  price: number;
  requesterIsStudent: boolean;
  ownedByApprover: boolean;
  pending: boolean;
}
export function canApproveFreeEnrollment(input: EnrollmentApproval): boolean {
  return input.ownedByApprover && input.pending && input.requesterIsStudent &&
    input.published && Number.isFinite(input.price) && input.price <= 0;
}
