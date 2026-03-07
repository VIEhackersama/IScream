/**
 * Shared API error extraction utility.
 *
 * The api-client throws:  "API POST /path failed (400): <body>"
 * The body is JSON: { success: false, message: "...", data: null, timestamp: "..." }
 * This helper extracts the human-readable `message` from that body.
 */
export function extractApiError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;

  const colonIdx = err.message.indexOf("): ");
  if (colonIdx !== -1) {
    try {
      const raw = err.message.slice(colonIdx + 3);
      const parsed = JSON.parse(raw) as { message?: string; Message?: string };
      if (parsed.message) return parsed.message;
      if (parsed.Message) return parsed.Message;
    } catch {
      // fall through
    }
  }
  return fallback;
}
