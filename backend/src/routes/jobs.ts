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
    const { title, description, requiredSkills, company } = req.body;

    if (req.userRole === 'CANDIDATE') {
      return res.status(403).json({ error: 'Candidates cannot create jobs' });
    }

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
        company: company || null,
        userId: req.userId!
      },
      include: {
        applications: {
          include: {
            candidate: true,
            submittedBy: true
          },
          orderBy: {
            matchScore: 'desc'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
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
      include: {
        applications: {
          include: {
            candidate: true,
            submittedBy: true
          },
          orderBy: {
            matchScore: 'desc'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
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
        id
      },
      include: {
        applications: {
          include: {
            candidate: true,
            submittedBy: true
          },
          orderBy: {
            matchScore: 'desc'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
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

jobsRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const isOwner = job.userId === req.userId;
    const isAdmin = req.userRole === 'ADMIN';
    const canDelete = isAdmin || (req.userRole === 'RECRUITER' && isOwner);

    if (!canDelete) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Job delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

jobsRouter.post('/:id/applications', async (req: AuthRequest, res) => {
  try {
    const { id: jobId } = req.params;
    const { resumeText } = req.body;

    if (!req.userRole || !req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: jobId
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.userId === req.userId) {
      return res.status(403).json({ error: 'Cannot apply to your own job' });
    }

    const canApply = ['ADMIN', 'RECRUITER', 'CANDIDATE'].includes(req.userRole);
    if (!canApply) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        submittedById: req.userId
      }
    });

    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }

    let originalResumeText: string;
    try {
      originalResumeText = await extractTextFromResume(req.files, resumeText);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to extract resume text' });
    }

    const sanitizedResumeText = sanitizeResume(originalResumeText);

    const extractedSkills = extractSkills(sanitizedResumeText);

    const requiredSkills = Array.isArray(job.requiredSkills)
      ? job.requiredSkills
      : [];
    const matchScore = calculateMatchScore(requiredSkills, extractedSkills);

    let candidate = await prisma.candidate.findFirst({
      where: {
        email: user.email
      }
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          fullName: user.name,
          email: user.email,
          phone: user.phone || null
        }
      });
    } else {
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          fullName: user.name,
          phone: user.phone || candidate.phone
        }
      });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
        submittedById: req.userId!,
        originalResumeText,
        sanitizedResumeText,
        extractedSkills,
        matchScore,
        status: 'PENDING'
      },
      include: {
        candidate: true,
        job: true,
        submittedBy: true
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
    const { status, order } = req.query as { status?: string; order?: string };

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const canView = req.userRole === 'ADMIN' || job.userId === req.userId;
    if (!canView) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const whereClause: any = { jobId };
    if (status && ['PENDING', 'SHORTLISTED', 'ON_HOLD', 'REJECTED'].includes(status)) {
      whereClause.status = status;
    }

    const orderDirection = order === 'asc' ? 'asc' : 'desc';

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        candidate: true,
        submittedBy: true
      },
      orderBy: {
        matchScore: orderDirection
      }
    });

    const sanitizedApplications = applications.map(app => ({
      id: app.id,
      candidate: app.candidate,
      extractedSkills: app.extractedSkills,
      matchScore: app.matchScore,
      submittedBy: app.submittedBy,
      status: app.status,
      notes: app.notes,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));

    res.json(sanitizedApplications);
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
