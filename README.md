# AlertHub — Backend

Node.js + Express + Prisma + PostgreSQL 16 REST API for AlertHub, a smart payment & reminder management SaaS.

## Tech Stack
 
- **Node.js 20** + **Express** — REST API server
- **Prisma ORM** — database access +  migrations
- **PostgreSQL 16** — primary database
- **JWT** (jsonwebtoken) — authentication
- **bcryptjs** — password hashing
- **Nodemailer** — Gmail SMTP email notifications
- **web-push** — VAPID push notifications
- **node-cron** — scheduled notification jobs
- **PM2** — process manager for production

## Local Development

```bash
npm install
cp .env.example .env     # fill in your values
npx prisma db push       # create tables
npm run dev              # http://localhost:3005
```

## Production Deployment (VPS)

```bash
# Upload code (skip node_modules and .env)
scp -r src prisma server.js package.json user@VPS_IP:/home/user/backend/

# On VPS
cd /home/user/backend
npm install
npx prisma generate
npx prisma db push
pm2 start server.js --name alerthub-api
pm2 save && pm2 startup
```

## Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/alerthub"
JWT_SECRET="long_random_secret_min_32_chars"
JWT_EXPIRES_IN="7d"
PORT=3005
NODE_ENV=production
CLIENT_URL="http://YOUR_FRONTEND_URL"
UPLOAD_DIR="./uploads"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your_gmail@gmail.com"
SMTP_PASS="your_16_char_app_password"
SMTP_FROM="AlertHub <your_gmail@gmail.com>"

VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"
VAPID_EMAIL="mailto:your_gmail@gmail.com"
```

## Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | |
| email | String | Unique |
| passwordHash | String | bcrypt |
| country | String | Default: India |
| plan | Enum | FREE / PERSONAL / FAMILY / BUSINESS |
| simBalance | Float | Default: 75000 |
| avatarUrl | String? | |

### Reminder
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| userId | String | FK → User (cascade delete) |
| title | String | |
| module | Enum | BUSINESS / FAMILY / FINANCE |
| category | String | GST, EMI, Rent, etc. |
| amount | Float | |
| dueDate | Date | |
| recurrence | Enum | NONE / MONTHLY / YEARLY |
| schedule | Int[] | Days-before for notification |
| channels | String[] | push, email, whatsapp, sms |
| completed | Boolean | |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Sign up |
| POST | /api/auth/login | No | Log in |
| POST | /api/auth/sandbox | No | Demo login |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/user/countries | No | Country list |
| GET | /api/user/profile | Yes | Get profile |
| PUT | /api/user/profile | Yes | Update name/country |
| PUT | /api/user/plan | Yes | Change plan |
| POST | /api/user/avatar | Yes | Upload avatar |
| GET | /api/reminders | Yes | List (paginated, filtered) |
| POST | /api/reminders | Yes | Create |
| PUT | /api/reminders/:id | Yes | Update |
| DELETE | /api/reminders/:id | Yes | Delete |
| PATCH | /api/reminders/:id/toggle | Yes | Toggle complete |
| DELETE | /api/reminders/bulk | Yes | Bulk delete |
| GET | /api/dashboard/stats | Yes | KPI summary |
| GET | /api/dashboard/today | Yes | Today's reminders |
| GET | /api/dashboard/upcoming | Yes | Next N days |
| GET | /api/dashboard/overdue | Yes | Overdue items |
| GET | /api/calendar/month | Yes | Month grid |
| GET | /api/calendar/day | Yes | Day detail |
| GET | /api/insights | Yes | AI insights |
| GET | /api/insights/cashflow | Yes | Cashflow chart |
| POST | /api/insights/query | Yes | AI chat Q&A |
| GET | /api/push/vapid-key | No | Public VAPID key |
| POST | /api/push/subscribe | Yes | Register push subscription |
| DELETE | /api/push/unsubscribe | Yes | Remove subscription |
| POST | /api/push/test | Yes | Send test push |
| POST | /api/push/test-email | Yes | Send test email |
| GET | /health | No | Health check |

## Notification Channels

| Channel | Status | Implementation |
|---------|--------|---------------|
| Push | Live | Web Push API + VAPID keys + Service Worker |
| Email | Live | Gmail SMTP via Nodemailer, cron at 8 AM daily |
| WhatsApp | Coming soon | — |
| SMS | Coming soon | — |

## Plans

| Plan | Price | Status |
|------|-------|--------|
| FREE | ₹0/mo | Active — 30 reminder cap, push only |
| PERSONAL | ₹99/mo | Active — unlimited reminders, email |
| FAMILY | ₹199/mo | Coming soon |
| BUSINESS | ₹499/mo | Coming soon |
