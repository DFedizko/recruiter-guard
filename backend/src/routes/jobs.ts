import express from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { extractTextFromResume } from '../services/resumeExtractor';
import { sanitizeResume } from '../services/resumeSanitizer';
import { extractSkills } from '../services/skillExtractor';
import { calculateMatchScore } from '../services/matchScorer';

export const jobsRouter = express.Router();

jobsRouter.use(requireAuth);

jobsRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, description, requiredSkills } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    let skillsArray: string[] = [];
    if (typeof requiredSkills === 'string') {
      skillsArray = requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(requiredSkills)) {
      skillsArray = requiredSkills;
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requiredSkills: skillsArray,
        userId: req.userId!
      },
      include: {
        applications: {
          include: {
            candidate: true
          },
          orderBy: {
            matchScore: 'desc'
          }
        }
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

jobsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        userId: req.userId!
      },
      include: {
        applications: {
          include: {
            candidate: true
          },
          orderBy: {
            matchScore: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(jobs);
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

jobsRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        userId: req.userId!
      },
      include: {
        applications: {
          include: {
            candidate: true
          },
          orderBy: {
            matchScore: 'desc'
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Job fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

jobsRouter.post('/:id/applications', async (req: AuthRequest, res) => {
  try {
    const { id: jobId } = req.params;
    const { fullName, email, phone, resumeText } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: req.userId!
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    let originalResumeText: string;
    try {
      originalResumeText = await extractTextFromResume(req.files, resumeText);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to extract resume text' });
    }

    const sanitizedResumeText = sanitizeResume(originalResumeText, {
      fullName,
      email,
      phone
    });

    const extractedSkills = extractSkills(sanitizedResumeText);

    const requiredSkills = Array.isArray(job.requiredSkills)
      ? job.requiredSkills
      : [];
    const matchScore = calculateMatchScore(requiredSkills, extractedSkills);

    let candidate = await prisma.candidate.findFirst({
      where: {
        email
      }
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          fullName,
          email,
          phone: phone || null
        }
      });
    } else {
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          fullName,
          phone: phone || candidate.phone
        }
      });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
        originalResumeText,
        sanitizedResumeText,
        extractedSkills,
        matchScore
      },
      include: {
        candidate: true,
        job: true
      }
    });

    res.json(application);
  } catch (error) {
    console.error('Application creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

jobsRouter.get('/:id/applications', async (req: AuthRequest, res) => {
  try {
    const { id: jobId } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: req.userId!
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const applications = await prisma.application.findMany({
      where: {
        jobId
      },
      include: {
        candidate: true
      },
      orderBy: {
        matchScore: 'desc'
      }
    });

    const sanitizedApplications = applications.map(app => ({
      id: app.id,
      candidate: app.candidate,
      extractedSkills: app.extractedSkills,
      matchScore: app.matchScore,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));

    res.json(sanitizedApplications);
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

