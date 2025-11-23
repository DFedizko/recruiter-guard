import express from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const applicationsRouter = express.Router();

applicationsRouter.use(requireAuth);

applicationsRouter.get('/me', async (req: AuthRequest, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        submittedById: req.userId!
      },
      include: {
        job: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const payload = applications.map(app => ({
      id: app.id,
      matchScore: app.matchScore,
      status: app.status,
      createdAt: app.createdAt,
      job: {
        id: app.job.id,
        title: app.job.title,
        company: app.job.company,
        user: {
          id: app.job.user.id,
          name: app.job.user.name,
          role: app.job.user.role
        }
      }
    }));

    res.json(payload);
  } catch (error) {
    console.error('My applications fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
        },
        submittedBy: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const isAdmin = req.userRole === 'ADMIN';
    const isOwner = application.job.userId === req.userId;
    const isApplicant = application.submittedById && application.submittedById === req.userId;

    if (!isAdmin && !isOwner && !isApplicant) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({
      id: application.id,
      candidate: application.candidate,
      job: {
        id: application.job.id,
        title: application.job.title,
        description: application.job.description,
        requiredSkills: application.job.requiredSkills,
        user: {
          id: application.job.user.id,
          name: application.job.user.name,
          email: application.job.user.email,
          role: application.job.user.role
        }
      },
      submittedBy: application.submittedBy,
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

    const isAdmin = req.userRole === 'ADMIN';
    const isOwner = application.job.userId === req.userId;
    if (!isAdmin && !isOwner) {
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
        job: {
          include: {
            user: true
          }
        },
        submittedBy: true
      }
    });

    res.json({
      id: updated.id,
      candidate: updated.candidate,
      job: {
        id: updated.job.id,
        title: updated.job.title,
        description: updated.job.description,
        requiredSkills: updated.job.requiredSkills,
        user: {
          id: updated.job.user.id,
          name: updated.job.user.name,
          email: updated.job.user.email,
          role: updated.job.user.role
        }
      },
      submittedBy: updated.submittedBy,
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

applicationsRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const isAdmin = req.userRole === 'ADMIN';
    const isApplicant = application.submittedById === req.userId;

    if (!isAdmin && !isApplicant) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.application.delete({ where: { id } });

    res.json({ message: 'Application deleted' });
  } catch (error) {
    console.error('Application delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
