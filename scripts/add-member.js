const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addMember() {
  try {
    const hashedPassword = await bcrypt.hash('member123', 10);

    const member = await prisma.user.create({
      data: {
        email: 'member@cyclingclub.be',
        passwordHash: hashedPassword,
        firstName: 'Jan',
        lastName: 'Janssen',
        phone: '+32 477 12 34 56',
        role: 'member',
        paymentStatus: 'paid',
        paymentYear: 2025,
        isActive: true,
      },
    });

    console.log('Member account created successfully:');
    console.log(`Email: ${member.email}`);
    console.log(`Password: member123`);
    console.log(`Name: ${member.firstName} ${member.lastName}`);
    console.log(`Role: ${member.role}`);
  } catch (error) {
    console.error('Error creating member:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addMember();
