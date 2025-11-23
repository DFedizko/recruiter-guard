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
      status: application.status,
      notes: application.notes,
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

applicationsRouter.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body as { status?: string; notes?: string };

    const allowedStatuses = ['PENDING', 'SHORTLISTED', 'ON_HOLD', 'REJECTED'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.job.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: status || application.status,
        notes: typeof notes === 'string' ? notes : application.notes
      },
      include: {
        candidate: true,
        job: true
      }
    });

    res.json({
      id: updated.id,
      candidate: updated.candidate,
      job: {
        id: updated.job.id,
        title: updated.job.title,
        description: updated.job.description,
        requiredSkills: updated.job.requiredSkills
      },
      extractedSkills: updated.extractedSkills,
      matchScore: updated.matchScore,
      status: updated.status,
      notes: updated.notes,
      sanitizedResumeText: updated.sanitizedResumeText,
      originalResumeText: updated.originalResumeText,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
  } catch (error) {
    console.error('Application update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
