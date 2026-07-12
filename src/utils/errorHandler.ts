// ─── Error Formatter ─────────────────────────────────────────────────────────
/**
 * Safely extracts a readable message from any error value.
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    if (typeof e['message'] === 'string') return e['message'];
  }
  return 'An unexpected error occurred. Please try again.';
}

// ─── Business Rule Error Formatter ───────────────────────────────────────────
/**
 * Formats a standard business rule violation message.
 * @param rule  Short name of the rule (e.g. 'Cargo Capacity')
 * @param detail  Human-readable explanation
 */
export function createBusinessRuleError(rule: string, detail: string): string {
  return `[${rule}] ${detail}`;
}

// ─── Success Message Formatter ────────────────────────────────────────────────
/**
 * Generates a consistent success message string.
 * @param action  e.g. 'added', 'updated', 'dispatched'
 * @param entity  e.g. 'Vehicle VR-912B', 'Trip TR-1005'
 */
export function createSuccessMessage(action: string, entity: string): string {
  return `${entity} has been ${action} successfully.`;
}

// ─── Async Action Wrapper ─────────────────────────────────────────────────────
/**
 * Wraps any synchronous or async operation with try/catch.
 * Returns { ok: true, data } or { ok: false, error: string }.
 */
export async function safeRun<T>(
  fn: () => T | Promise<T>
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: formatError(err) };
  }
}
