/** Versioned JWT claims provide temporary account-wide revocation. */
export function isSessionVersionValid(tokenVersion: unknown, storedVersion: unknown): boolean {
  return typeof tokenVersion === 'number' && Number.isSafeInteger(tokenVersion) && tokenVersion >= 0 &&
    typeof storedVersion === 'number' && Number.isSafeInteger(storedVersion) && storedVersion >= 0 &&
    tokenVersion === storedVersion;
}
