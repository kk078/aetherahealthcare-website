/** IDs are configuration, not executable JavaScript. Invalid IDs disable a tag. */
export function safeTrackingId(value: string | undefined): string {
  return value && /^[a-zA-Z0-9_-]{1,100}$/.test(value) ? value : '';
}
