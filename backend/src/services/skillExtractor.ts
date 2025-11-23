const SKILL_KEYWORDS = [
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin',
  'html', 'css', 'sql', 'r', 'scala', 'perl', 'bash', 'shell',
  
  // Frameworks & Libraries
  'react', 'react.js', 'vue', 'angular', 'node.js', 'express', 'next.js', 'nuxt', 'svelte',
  'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails', 'asp.net',
  'jquery', 'bootstrap', 'tailwind', 'tailwindcss', 'sass', 'less',
  
  // Databases
  'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
  'oracle', 'sqlite', 'mariadb',
  
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
  'ci/cd', 'github actions', 'gitlab', 'circleci',
  
  // Tools & Technologies
  'git', 'linux', 'unix', 'agile', 'scrum', 'rest', 'graphql', 'microservices',
  'api', 'tcp/ip', 'http', 'websocket',
  
  // Data & Analytics
  'machine learning', 'deep learning', 'data science', 'pandas', 'numpy', 'tensorflow',
  'pytorch', 'scikit-learn', 'tableau', 'power bi',
  
  // Other
  'project management', 'leadership', 'team management', 'communication',
  'problem solving', 'analytical thinking'
];

export function extractSkills(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundSkills: Set<string> = new Set();

  SKILL_KEYWORDS.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.add(skill);
    }
  });

  const experiencePattern = /(?:experience|proficient|skilled|expert|familiar)\s+(?:with|in)\s+([^.,;]+)/gi;
  let match;
  while ((match = experiencePattern.exec(text)) !== null) {
    const skills = match[1].split(/[,&]/).map(s => s.trim().toLowerCase());
    skills.forEach(skill => {
      if (skill.length > 2 && skill.length < 50) {
        foundSkills.add(skill);
      }
    });
  }

  return Array.from(foundSkills).sort();
}

