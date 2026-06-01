import { Router, Request, Response, NextFunction } from 'express';
import * as auth from '../lib/auth';
import { prisma } from '../lib/prisma';
import { BadRequestError, UnauthorizedError } from '../lib/errors';

// Minimal types for Google tokeninfo response
interface GoogleTokenInfo {
  email?: string;
  name?: string;
  picture?: string;
  aud?: string;
  error_description?: string;
  [key: string]: unknown;
}

interface GoogleCredentialPayload {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
}

async function verifyGoogleToken(credential: string): Promise<GoogleCredentialPayload> {
  // Try Google's tokeninfo endpoint first
  try {
    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const googleRes = await fetch(tokenInfoUrl);
    const tokenInfo = await googleRes.json() as GoogleTokenInfo;

    if (tokenInfo.error_description) {
      throw new UnauthorizedError('Google token verification failed: ' + String(tokenInfo.error_description));
    }

    // Verify audience if we have a client ID configured
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (googleClientId && tokenInfo.aud !== googleClientId) {
      throw new UnauthorizedError('Token was not issued for this application');
    }

    if (!tokenInfo.email) {
      throw new UnauthorizedError('Google token missing email');
    }

    return {
      email: String(tokenInfo.email).toLowerCase(),
      name: tokenInfo.name ? String(tokenInfo.name) : String(tokenInfo.email).split('@')[0],
      picture: tokenInfo.picture ? String(tokenInfo.picture) : undefined,
      sub: tokenInfo.aud ? String(tokenInfo.aud) : undefined,
    };
  } catch (e) {
    if (e instanceof UnauthorizedError || e instanceof BadRequestError) throw e;
    // Fallback: decode JWT payload directly (works when Google API is unreachable)
    const parts = credential.split('.');
    if (parts.length !== 3) throw new UnauthorizedError('Invalid Google token format');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString()) as GoogleCredentialPayload;
    if (!payload.email) throw new UnauthorizedError('Google token missing email');
    return {
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
      sub: payload.sub,
    };
  }
}

// Helper: find or create user from Google profile
async function findOrCreateGoogleUser(profile: {
  email: string;
  name: string;
  image?: string;
}) {
  const email = profile.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: profile.name,
        avatarUrl: profile.image || null,
        passwordHash: null, // OAuth-only user
      },
    });
  } else {
    // Update profile info on each login
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: profile.name,
        avatarUrl: profile.image || user.avatarUrl,
      },
    });
  }

  return user;
}

const router = Router();

// ── POST /api/auth/google — Verify Google ID token & issue JWT
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      throw new BadRequestError('Google credential is required');
    }

    const profile = await verifyGoogleToken(credential);
    const user = await findOrCreateGoogleUser({
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      image: profile.picture,
    });
    const token = auth.signToken(user.id);

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
          familyId: user.familyId,
          isNewUser: !user.passwordHash && profile.name === user.name,
        },
        token,
        isNewUser: !user.passwordHash && profile.name === user.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
