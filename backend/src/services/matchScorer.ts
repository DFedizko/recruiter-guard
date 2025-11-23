export function calculateMatchScore(
  requiredSkills: string[],
  extractedSkills: string[]
): number {
  if (requiredSkills.length === 0) {
    return 0;
  }

  if (extractedSkills.length === 0) {
    return 0;
  }

  const normalizedRequired = requiredSkills.map(s => s.trim().toLowerCase());
  const normalizedExtracted = extractedSkills.map(s => s.trim().toLowerCase());

  let matches = 0;
  normalizedRequired.forEach(required => {
    if (normalizedExtracted.includes(required)) {
      matches++;
    } else {
      const found = normalizedExtracted.some(extracted => {
        return extracted.includes(required) || required.includes(extracted);
      });
      if (found) {
        matches++;
      }
    }
  });

  const baseScore = (matches / normalizedRequired.length) * 100;

  const additionalSkills = normalizedExtracted.length - matches;
  const bonus = Math.min(additionalSkills * 2, 10);

  return Math.min(baseScore + bonus, 100);
}

