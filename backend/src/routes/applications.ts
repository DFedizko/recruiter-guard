import express from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const applicationsRouter = express.Router();

applicationsRouter.use(requireAuth);

applicationsRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: {
          include: {
            user: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.job.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({
      id: application.id,
      candidate: application.candidate,
      job: {
        id: application.job.id,
        title: application.job.title,
        description: application.job.description,
        requiredSkills: application.job.requiredSkills
      },
      extractedSkills: application.extractedSkills,
      matchScore: application.matchScore,
      sanitizedResumeText: application.sanitizedResumeText,
      originalResumeText: application.originalResumeText,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    });
  } catch (error) {
    console.error('Application fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

