const bcrypt = require('bcryptjs');

async function generateHash() {
  const hashedPassword = await bcrypt.hash('member123', 10);
  console.log('Run this SQL in Prisma Studio or psql:');
  console.log('');
  console.log(`INSERT INTO users (email, password_hash, first_name, last_name, phone, role, payment_status, payment_year, is_active, created_at, updated_at)
VALUES (
  'member@cyclingclub.be',
  '${hashedPassword}',
  'Jan',
  'Janssen',
  '+32 477 12 34 56',
  'member',
  'paid',
  2025,
  true,
  NOW(),
  NOW()
);`);
  console.log('');
  console.log('Login credentials:');
  console.log('Email: member@cyclingclub.be');
  console.log('Password: member123');
}

generateHash();
