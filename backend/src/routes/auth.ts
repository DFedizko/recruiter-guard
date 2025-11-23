import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { requireAuth, type AuthRequest } from '../middleware/auth';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, avatarUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const allowedRoles = ['ADMIN', 'RECRUITER', 'CANDIDATE'];
    const roleValue = allowedRoles.includes(role) ? role : 'RECRUITER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: roleValue as any,
        phone: phone || null,
        avatarUrl: avatarUrl || null
      }
    });

    res.cookie('sessionId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.cookie('sessionId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('sessionId');
  res.json({ message: 'Logged out' });
});

authRouter.get('/me', async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.patch('/avatar', requireAuth, async (req: AuthRequest, res) => {
  try {
    const avatar = req.body?.avatar;

    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (avatar !== null && avatar !== undefined && typeof avatar !== 'string') {
      return res.status(400).json({ error: 'Formato de avatar inválido' });
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl: avatar || null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
