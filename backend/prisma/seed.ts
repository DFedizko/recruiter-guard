import { PrismaClient, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const seedPassword = 'senha123';

const recruiterSeeds = [
  {
    name: 'Carla Souza',
    email: 'carla@techwave.com',
    phone: '+55 11 98888-1010',
  },
  {
    name: 'Fernando Lima',
    email: 'fernando@inovare.com',
    phone: '+55 21 97777-2020',
  },
];

const candidateSeeds = [
  {
    name: 'Ana Martins',
    email: 'ana@talentos.com',
    phone: '+55 11 96666-3030',
  },
  {
    name: 'Bruno Oliveira',
    email: 'bruno@talentos.com',
    phone: '+55 21 95555-4040',
  },
  {
    name: 'Luiza Campos',
    email: 'luiza@talentos.com',
    phone: '+55 31 94444-5050',
  },
];

const jobSeeds = [
  {
    recruiterEmail: 'carla@techwave.com',
    title: 'Desenvolvedor Frontend React',
    description:
      'Criação de interfaces web responsivas com React e Next.js, colaborando com squads ágeis.',
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Jest'],
    company: 'TechWave',
  },
  {
    recruiterEmail: 'carla@techwave.com',
    title: 'Product Designer Pleno',
    description:
      'Planejamento e prototipação de experiências digitais com foco em usabilidade e design system.',
    requiredSkills: ['Figma', 'UX Research', 'UI Design', 'Design System'],
    company: 'TechWave',
  },
  {
    recruiterEmail: 'fernando@inovare.com',
    title: 'Desenvolvedor Backend Node.js',
    description:
      'Desenvolvimento de APIs escaláveis com Node.js, integrações REST e mensageria.',
    requiredSkills: ['Node.js', 'TypeScript', 'Prisma', 'MySQL', 'Docker'],
    company: 'Inovare Digital',
  },
  {
    recruiterEmail: 'fernando@inovare.com',
    title: 'Analista de Dados',
    description:
      'Construção de dashboards e análises exploratórias para apoiar decisões de negócio.',
    requiredSkills: ['SQL', 'Python', 'Power BI', 'ETL'],
    company: 'Inovare Digital',
  },
];

const applicationSeeds: Array<{
  jobTitle: string;
  candidateEmail: string;
  status: ApplicationStatus;
  matchScore: number;
  notes?: string;
  skills: string[];
}> = [
  {
    jobTitle: 'Desenvolvedor Frontend React',
    candidateEmail: 'ana@talentos.com',
    status: 'SHORTLISTED',
    matchScore: 88.4,
    notes: 'Bom domínio de testes e acessibilidade.',
    skills: ['React', 'TypeScript', 'Jest', 'Testing Library'],
  },
  {
    jobTitle: 'Desenvolvedor Frontend React',
    candidateEmail: 'bruno@talentos.com',
    status: 'PENDING',
    matchScore: 72.3,
    skills: ['React', 'TailwindCSS', 'Storybook'],
  },
  {
    jobTitle: 'Product Designer Pleno',
    candidateEmail: 'luiza@talentos.com',
    status: 'PENDING',
    matchScore: 69.7,
    skills: ['Figma', 'Design System', 'UX Research'],
  },
  {
    jobTitle: 'Product Designer Pleno',
    candidateEmail: 'ana@talentos.com',
    status: 'ON_HOLD',
    matchScore: 63.1,
    notes: 'Precisa reforçar entregáveis mobile.',
    skills: ['Figma', 'Prototipagem', 'UX Writing'],
  },
  {
    jobTitle: 'Desenvolvedor Backend Node.js',
    candidateEmail: 'luiza@talentos.com',
    status: 'SHORTLISTED',
    matchScore: 91.1,
    notes: 'Experiência com mensageria e monitoramento.',
    skills: ['Node.js', 'TypeScript', 'Kafka', 'Docker'],
  },
  {
    jobTitle: 'Desenvolvedor Backend Node.js',
    candidateEmail: 'ana@talentos.com',
    status: 'ON_HOLD',
    matchScore: 64.2,
    skills: ['Node.js', 'Prisma', 'REST'],
  },
  {
    jobTitle: 'Analista de Dados',
    candidateEmail: 'bruno@talentos.com',
    status: 'REJECTED',
    matchScore: 52.4,
    notes: 'Faltou experiência com modelagem dimensional.',
    skills: ['SQL', 'Power BI'],
  },
  {
    jobTitle: 'Analista de Dados',
    candidateEmail: 'luiza@talentos.com',
    status: 'SHORTLISTED',
    matchScore: 85.9,
    skills: ['SQL', 'Python', 'ETL', 'Airflow'],
  },
];

function buildResumeText(name: string, skills: string[]) {
  return `${name} com experiência em ${skills.join(', ')}. Projetos recentes envolvendo times multidisciplinares e entregas orientadas a resultado.`;
}

async function main() {
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  await prisma.application.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const recruiters = await Promise.all(
    recruiterSeeds.map((user) =>
      prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash,
          role: 'RECRUITER',
          phone: user.phone,
        },
      })
    )
  );

  const candidates = await Promise.all(
    candidateSeeds.map((user) =>
      prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash,
          role: 'CANDIDATE',
          phone: user.phone,
        },
      })
    )
  );

  const usersByEmail = [...recruiters, ...candidates].reduce<Record<string, typeof recruiters[number]>>(
    (acc, user) => {
      acc[user.email] = user;
      return acc;
    },
    {}
  );

  const candidateProfiles = await Promise.all(
    candidates.map((user) =>
      prisma.candidate.create({
        data: {
          fullName: user.name,
          email: user.email,
          phone: user.phone,
        },
      })
    )
  );

  const candidateByEmail = candidateProfiles.reduce<Record<string, typeof candidateProfiles[number]>>(
    (acc, candidate) => {
      acc[candidate.email] = candidate;
      return acc;
    },
    {}
  );

  const jobs = await Promise.all(
    jobSeeds.map((job) => {
      const recruiter = recruiters.find((r) => r.email === job.recruiterEmail);
      if (!recruiter) {
        throw new Error(`Recruiter not found for job: ${job.title}`);
      }

      return prisma.job.create({
        data: {
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills,
          company: job.company,
          userId: recruiter.id,
        },
      });
    })
  );

  const jobsByTitle = jobs.reduce<Record<string, typeof jobs[number]>>((acc, job) => {
    acc[job.title] = job;
    return acc;
  }, {});

  for (const application of applicationSeeds) {
    const job = jobsByTitle[application.jobTitle];
    const candidate = candidateByEmail[application.candidateEmail];
    const submittingUser = usersByEmail[application.candidateEmail];

    if (!job || !candidate || !submittingUser) {
      continue;
    }

    const resume = buildResumeText(candidate.fullName, application.skills);

    await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        submittedById: submittingUser.id,
        originalResumeText: resume,
        sanitizedResumeText: resume,
        extractedSkills: application.skills,
        matchScore: application.matchScore,
        status: application.status,
        notes: application.notes || null,
      },
    });
  }

  console.log('Seeds criados com sucesso.');
}

main()
  .catch((error) => {
    console.error('Erro ao popular dados:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
