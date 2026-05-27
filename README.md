# TripFamily — Family Trip Planner

🌏 A mobile-first iOS PWA for families traveling together.
Plan trips to Thailand, Japan, Korea — and anywhere else!

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS (PWA, RTL Hebrew)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Auth:** NextAuth.js (Google OAuth)
- **Storage:** Cloudinary
- **Deploy:** Vercel (frontend) + Render (backend)

## Project Structure

```
tripfamily/
├── frontend/          # Next.js PWA
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities, auth, i18n
│   ├── messages/      # i18n translations (he/en)
│   └── public/        # Static assets, PWA icons
├── backend/           # Express API
│   ├── src/           # API source
│   ├── prisma/        # DB schema & migrations
│   └── tests/         # API tests
├── .github/           # GitHub Actions CI/CD
└── docs/              # Documentation
```

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Run database migrations (requires DATABASE_URL)
cd backend && npx prisma migrate dev

# Start development servers
npm run dev
```

## Phases

- [x] Phase 0: Planning & Architecture
- [ ] Phase 1: Foundation & Auth
- [ ] Phase 2: Trip Management Core
- [ ] Phase 3: Travel Suggestions Engine
- [ ] Phase 4: Social Media Aggregation
- [ ] Phase 5: Collaboration & Sharing
- [ ] Phase 6: Budget Planner
- [ ] Phase 7: Media & App Store
- [ ] Phase 8: Polish & Launch

## License

MIT © 2026 TripFamily
