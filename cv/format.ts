/** Format month-precision profile dates without inventing a day or local timezone. */
export function workDateText(value: string | null) {
  if (value === null) return 'Present'
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1)))
}
