export function sanitizeResume(
  text: string,
): string {
  const sanitized = text
    .normalize('NFKD')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return sanitized;
}
