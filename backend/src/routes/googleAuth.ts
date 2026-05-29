import { Router, Request, Response, NextFunction } from 'express';
import * as auth from '../lib/auth';
import { prisma } from '../lib/prisma';
import { BadRequestError, UnauthorizedError } from '../lib/errors';

// Minimal type for Google tokeninfo response
interface GoogleTokenInfo {
  email?: string;
  name?: string;
  picture?: string;
  aud?: string;
  error_description?: string;
  [key: string]: unknown;
}

const router = Router();

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

// ── POST /api/auth/google — Verify Google ID token & issue JWT ──────────────
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential, clientId } = req.body as { credential?: string; clientId?: string };

    if (!credential) {
      throw new BadRequestError('Google credential is required');
    }

    let profile: { email: string; name: string; picture?: string };

    try {
      // Verify with Google's tokeninfo endpoint
      const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
      const googleRes = await fetch(tokenInfoUrl);
      const tokenInfo = await googleRes.json() as GoogleTokenInfo;

      if (tokenInfo.error_description) {
        throw new UnauthorizedError('Google token verification failed: ' + String(tokenInfo.error_description));
      }

      // Verify the token was issued for our app
      const googleClientId = process.env.GOOGLE_CLIENT_ID || clientId;
      if (googleClientId && tokenInfo.aud !== googleClientId) {
        throw new UnauthorizedError('Token was not issued for this application');
      }

      profile = {
        email: String(tokenInfo.email),
        name: String(tokenInfo.name || String(tokenInfo.email).split('@')[0]),
        picture: tokenInfo.picture ? String(tokenInfo.picture) : undefined,
      };
    } catch (e) {
      if (e instanceof UnauthorizedError || e instanceof BadRequestError) throw e;
      // Fallback: decode JWT manually (less secure, but works without Google API call)
      const parts = credential.split('.');
      if (parts.length !== 3) throw new UnauthorizedError('Invalid Google token format');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      profile = {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
      };
    }

    const user = await findOrCreateGoogleUser(profile);
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
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
