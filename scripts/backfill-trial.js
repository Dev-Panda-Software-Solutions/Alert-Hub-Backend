/**
 * One-time backfill: give all existing users a fresh 28-day Personal trial
 * starting from TODAY.  Safe to run multiple times — skips users who already
 * have trialEndsAt set.
 *
 * Usage (on VPS after `npx prisma db push`):
 *   node scripts/backfill-trial.js
 */

const prisma = require('../src/config/db');

async function main() {
  const trialEndsAt = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);

  const result = await prisma.user.updateMany({
    where: { trialEndsAt: null },
    data: {
      plan:        'PERSONAL',
      trialEndsAt,
      trialSeen:   false,   // they'll see the welcome popup on next login
    },
  });

  console.log(
    `✓ Backfilled ${result.count} existing user(s).` +
    ` Trial ends: ${trialEndsAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
  );
}

main()
  .catch((e) => { console.error('Backfill failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
