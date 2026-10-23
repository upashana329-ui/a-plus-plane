// Joins class names and skips anything falsy (false, null, undefined, '').
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}