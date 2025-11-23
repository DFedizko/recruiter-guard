import { SyncRedactor } from 'redact-pii';

const redactor = new SyncRedactor();

const TECH_WHITELIST = [
  'javascript', 'typescript', 'node', 'react', 'next', 'python', 'java', 'c++', 'c#', 'php', 'ruby',
  'go', 'golang', 'rust', 'swift', 'kotlin', 'sql', 'nosql', 'mysql', 'postgres', 'postgresql',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'devops', 'frontend', 'backend', 'fullstack',
  'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'django', 'flask', 'spring', 'laravel'
];

const NAME_PATTERN = /\b([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+\s){1,3}[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+\b/g;

function maskLikelyNames(text: string): string {
  return text.replace(NAME_PATTERN, (match) => {
    const lower = match.toLowerCase();
    const hasTech = TECH_WHITELIST.some((term) => lower.includes(term));
    if (hasTech) return match; // avoid masking tech stack names
    return '[NAME]';
  });
}

export function sanitizeResume(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const normalized = text
    .normalize('NFKD')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const redacted = redactor.redact(normalized);
  const safeText = typeof redacted === 'string' ? redacted : normalized;
  return maskLikelyNames(safeText);
}
