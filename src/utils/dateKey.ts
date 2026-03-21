// ─── dateKey ───────────────────────────────────────────────────────────────────
// Returns 'YYYY-MM-DD' in the user's LOCAL timezone.
// Never use Date.toISOString() for date comparisons — that's UTC and will
// cause "new day" to trigger at the wrong time for users outside UTC.

export function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
