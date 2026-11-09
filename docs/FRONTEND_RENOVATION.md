# iremehub+ Frontend Renovation — implementation status

**Branch:** `rebuild/iremehub-plus`  
**Status:** work in progress, not release-certified.  
**Last revised:** 2026-11-09.

## Design direction
- Deep forest ink `#17372d`, primary green `#19654e`, warm ivory `#f5f7f2`, lime highlight `#d8f59d`.
- Shared tokens in `client/app/styles/iremehub.css`; application/workspace styles in `workspace.css`.
- Reusable navigation, footer, brand mark, empty/error/loading views, course cards, filters, forms and notification dropdown.
- Responsive-first layouts, focus-visible indicators, descriptive form labels and reduced-motion support.

## Fully rewritten page experiences
- Public homepage, course catalog, course detail, About, Journal, article detail and Contact.
- Account: sign in, registration, forgot/reset password, profile and password change.
- Learner dashboard.
- Certificate list and details/verification/download.
- Admin: users, courses, blog management, blog creation and blog editing.
- Educator enrollment approval queue.
- Educator course list, learner details, learner enrollments, announcements and a shared course studio with live section, lesson, quiz, exam, YouTube and assignment authoring.

## Adapted pages (visual system applied; UX follow-up required)
- Educator dashboard analytics and remaining administrative subflows; verify server response contracts end-to-end.
- Other role-based management and coursework routes.
- Existing lesson player retains parts of its legacy learning logic, but has a responsive mobile sidebar, visible activity feedback, server-graded quizzes and safe plaintext lesson display. It needs full browser QA.

## Data integrity / design guardrails
- Do not invent student metrics, published courses, ratings, posts or certificate completion.
- API loading/error/empty states are visible and understandable.
- Prevent unauthorized self-provisioned admin access; learners need backend-verified enrollment.
- Blog creation and admin tables now call backend APIs rather than fake-data demos.
- Certificates download genuine PDFs from a protected endpoint.
- Course authoring now uses actual persisted model fields and an authenticated editing endpoint, rather than forms that silently drop unmodeled fields.
- Browser API requests use the single same-origin /api/v1 proxy, configured by API_PROXY_TARGET for deployment.
- Lesson reads require enrollment/instructor/admin access; student responses omit quiz/exam answer keys. Quiz grading and assessment completion are server-enforced, pending end-to-end tests.

## Explicit unfinished work / blockers
- `client` must pass a real TypeScript/ESLint/Next.js build and browser E2E tests; no green remote CI result has been recorded. GitHub Actions has reported no-step failures requiring diagnosis.
- Some legacy route modules still contain old logic and require deep UX accessibility and functional testing.
- Contact service is not connected; the UI returns an honest failure when unconfigured.
- Secure, revocable sessions, tenant-aware backend authorization, payment flows and subscription UI have not yet been implemented.
- Course authoring and progress/assessment flows need a verified end-to-end regression suite.
- Next.js TypeScript and lint error suppression was removed; builds are now expected to fail until outstanding validation problems are resolved.
- GitHub Actions jobs currently fail without any recorded step summaries. Job-log retrieval returns BlobNotFound, so the specific runner/validation failure is not yet confirmed.
- Browser navigation, course studio media uploads, quiz/exam submissions and certificate PDF downloads require tests against running frontend/backend and an isolated test database.
- No browser/device screenshot-based visual QA has been completed in this session.

## Local commands
```bash
cd client
npm ci
npm run typecheck
npm run lint
npm run build
npm run dev
```
The Renovation is not complete until all checks and real-user journeys pass, including auth, enrollment, course authoring, learning, assessments, administration and credential issuance.

## Minimum browser acceptance matrix
| Scenario | Verify |
|---|---|
| 320/375/768/1280px viewports | No horizontal overflow; readable actions and dialogs |
| Guest course browsing | Only published content; no student identities leaked |
| Login / signup | Real auth state; correct redirect and errors |
| Student dashboard | Only owned courses; correct progress |
| Educator authoring | Drafts editable and unauthorized edits rejected |
| Course classroom | Video/text/quiz/assignment/exam, resume and completion |
| Admin users | Real data only; role edits and delete confirmation |
| Blog authoring | Draft/publish/edit/delete against API |
| Certificates | Auth checks, PDF download and independent verification |
| Failures | Real API errors; no invented success screens |
| Keyboard and screen readers | Focus order, labels, ESC, announcements |
| Mobile & low-bandwidth | Fast initial experience, usable navigation |

**Backup policy:** changes are individually committed to `rebuild/iremehub-plus`; original `main` remains unchanged. Review on draft PR #1 before merging.
