const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Crear usuarios con upsert
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      password: 'password123',
      name: 'User One',
      role: 'USER'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN'
    }
  });

  // Crear bloques de tiempo (sin duplicar)
  const timeBlock1 = await prisma.timeBlock.create({
    data: {
      startTime: new Date('2023-10-01T09:00:00Z'),
      endTime: new Date('2023-10-01T10:00:00Z')
    }
  });

  const timeBlock2 = await prisma.timeBlock.create({
    data: {
      startTime: new Date('2023-10-01T10:00:00Z'),
      endTime: new Date('2023-10-01T11:00:00Z')
    }
  });

  // Crear citas
  await prisma.appointment.create({
    data: {
      date: new Date('2023-10-01T09:00:00Z'),
      user: { connect: { id: user1.id } },
      timeBlock: { connect: { id: timeBlock1.id } }
    }
  });

  await prisma.appointment.create({
    data: {
      date: new Date('2023-10-01T10:00:00Z'),
      user: { connect: { id: user2.id } },
      timeBlock: { connect: { id: timeBlock2.id } }
    }
  });

  console.log('✅ Seed ejecutado correctamente.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
