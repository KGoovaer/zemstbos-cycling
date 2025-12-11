import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function main() {
  // Create initial admin user
  const adminPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cyclingclub.be' },
    update: {},
    create: {
      email: 'admin@cyclingclub.be',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      paymentStatus: 'exempt',
      isActive: true,
    },
  })

  // Create current season (2025)
  const season2025 = await prisma.season.upsert({
    where: { year: 2025 },
    update: {},
    create: {
      year: 2025,
      startDate: new Date('2025-03-02'), // First Sunday of March
      endDate: new Date('2025-10-26'),   // Last Sunday of October
      isActive: true,
    },
  })

  console.log({ admin, season2025 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
