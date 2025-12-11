/**
 * Utility functions for the cycling club application
 */

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Combine class names conditionally
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
