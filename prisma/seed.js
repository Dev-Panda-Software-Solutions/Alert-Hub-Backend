const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AlertHub database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@alerthub.app' },
    update: {},
    create: {
      name: 'Dr. Balaji',
      email: 'demo@alerthub.app',
      passwordHash,
      country: 'India',
      plan: 'PERSONAL',
      simBalance: 75000,
    },
  });

  console.log(`  ✓ User: ${user.email}`);

  // Clear existing reminders
  await prisma.reminder.deleteMany({ where: { userId: user.id } });

  const today = new Date();
  const addDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const reminders = [
    { title: 'GST Filing Q1',          module: 'BUSINESS', category: 'gst',            amount: 28500,  dueDate: addDays(5),   recurrence: 'MONTHLY', channels: ['push', 'email'] },
    { title: 'Office Rent – June',      module: 'BUSINESS', category: 'office_rent',    amount: 35000,  dueDate: addDays(2),   recurrence: 'MONTHLY', channels: ['push'] },
    { title: 'Employee Salary',         module: 'BUSINESS', category: 'employee_salary', amount: 125000, dueDate: addDays(8),   recurrence: 'MONTHLY', channels: ['push', 'email'] },
    { title: 'Electricity Bill',        module: 'FAMILY',   category: 'electricity',    amount: 4200,   dueDate: addDays(3),   recurrence: 'MONTHLY', channels: ['push'] },
    { title: 'Airtel Broadband',        module: 'FAMILY',   category: 'broadband',      amount: 999,    dueDate: addDays(12),  recurrence: 'MONTHLY', channels: ['push'] },
    { title: 'Netflix + Hotstar',       module: 'FAMILY',   category: 'ott',            amount: 1200,   dueDate: addDays(18),  recurrence: 'MONTHLY', channels: ['push'] },
    { title: 'Home Loan EMI',           module: 'FINANCE',  category: 'home_loan',      amount: 42000,  dueDate: addDays(1),   recurrence: 'MONTHLY', channels: ['push', 'email'] },
    { title: 'LIC Premium',             module: 'FINANCE',  category: 'lic',            amount: 18000,  dueDate: addDays(30),  recurrence: 'YEARLY',  channels: ['push'] },
    { title: 'HDFC Credit Card',        module: 'FINANCE',  category: 'credit_card',    amount: 15600,  dueDate: addDays(-2),  recurrence: 'MONTHLY', channels: ['push', 'email'] },
    { title: 'Mutual Fund SIP',         module: 'FINANCE',  category: 'sip',            amount: 5000,   dueDate: addDays(7),   recurrence: 'MONTHLY', channels: ['push'] },
  ];

  const created = await Promise.all(
    reminders.map((r) => prisma.reminder.create({ data: { ...r, userId: user.id } }))
  );

  console.log(`  ✓ ${created.length} reminders seeded`);
  console.log('\n✅ Seeding complete!');
  console.log('   Login: demo@alerthub.app / demo1234\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
