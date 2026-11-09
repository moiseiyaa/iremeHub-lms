/** Pure assessment input and exam-timer guards; no DB or network dependencies. */
export interface MultipleChoicePrompt {
  options: readonly unknown[];
}

export function hasCompleteAnswers(
  submitted: unknown,
  questions: readonly MultipleChoicePrompt[]
): submitted is number[] {
  return Array.isArray(submitted) &&
    questions.length > 0 &&
    submitted.length === questions.length &&
    submitted.every((answer: unknown, index: number) =>
      Number.isInteger(answer) &&
      (answer as number) >= 0 &&
      (answer as number) < questions[index].options.length);
}

export function isExamSessionActive(
  startedAt: Date,
  expiresAt: Date,
  submittedAt: Date | undefined,
  currentTime: number
): boolean {
  const started = startedAt.getTime();
  const expires = expiresAt.getTime();
  return !submittedAt && Number.isFinite(started) && Number.isFinite(expires) &&
    started <= currentTime && expires > currentTime;
}

export function remainingMinutes(expiresAt: Date, currentTime: number): number {
  return Math.max(0, (expiresAt.getTime() - currentTime) / 60_000);
}
