export function sanitizeResume(text: string, candidateInfo?: {
  fullName?: string;
  email?: string;
  phone?: string;
}): string {
  let sanitized = text;

  if (candidateInfo?.fullName) {
    const nameParts = candidateInfo.fullName.split(/\s+/);
    nameParts.forEach(part => {
      if (part.length > 2) {
        const regex = new RegExp(part, 'gi');
        sanitized = sanitized.replace(regex, '[NAME]');
      }
    });
  }

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  sanitized = sanitized.replace(emailRegex, '[EMAIL]');

  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10,}/g;
  sanitized = sanitized.replace(phoneRegex, '[PHONE]');

  const addressPatterns = [
    /\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)[\s,]*[A-Za-z\s,]*\d{5}/gi,
    /P\.?O\.?\s*Box\s+\d+/gi,
  ];
  addressPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[ADDRESS]');
  });

  const dobPatterns = [
    /(?:date\s+of\s+birth|dob|born|age)[\s:]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/gi,
    /age[\s:]*\d{1,3}/gi,
  ];
  dobPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[DATE]');
  });

  const socialPatterns = [
    /(?:linkedin|github|twitter|facebook|instagram)[\s:]*\.com\/[\w\-]+/gi,
    /https?:\/\/(?:www\.)?(?:linkedin|github|twitter|facebook|instagram)\.com\/[\w\-]+/gi,
  ];
  socialPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[SOCIAL]');
  });

  const urlRegex = /https?:\/\/[^\s]+/g;
  sanitized = sanitized.replace(urlRegex, '[URL]');

  if (candidateInfo?.phone) {
    const phoneClean = candidateInfo.phone.replace(/[\s\-\(\)]/g, '');
    sanitized = sanitized.replace(new RegExp(phoneClean, 'g'), '[PHONE]');
    sanitized = sanitized.replace(new RegExp(candidateInfo.phone, 'g'), '[PHONE]');
  }

  if (candidateInfo?.email) {
    sanitized = sanitized.replace(new RegExp(candidateInfo.email, 'gi'), '[EMAIL]');
  }

  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

