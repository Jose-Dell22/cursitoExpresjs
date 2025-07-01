// Import Prisma Client
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // 1. Delete all users
  await prisma.user.deleteMany();
  console.log(' All users deleted');

  // 2. Create sample users
  const createdUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'alice123',
        role: 'ADMIN'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'bob123',
        role: 'USER'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Charlie Lee',
        email: 'charlie@example.com',
        password: 'charlie123',
        role: 'USER'
      }
    })
  ]);
  console.log(' Sample users created:', createdUsers);

  // 3. Read all users
  const allUsers = await prisma.user.findMany();
  console.log(' All users:', allUsers);

  // 4. Update one user’s name and role (e.g., Bob to "Robert Smith", role to ADMIN)
  const bob = allUsers.find(u => u.email === 'bob@example.com');
  const updatedUser = await prisma.user.update({
    where: { id: bob.id },
    data: {
      name: 'Robert Smith',
      role: 'ADMIN'
    }
  });
  console.log(' Updated user:', updatedUser);

  // 5. Delete one user by ID (e.g., Charlie)
  const charlie = allUsers.find(u => u.email === 'charlie@example.com');
  const deletedUser = await prisma.user.delete({
    where: { id: charlie.id }
  });
  console.log(' Deleted user:', deletedUser);

  // 6. Final list of users
  const finalUsers = await prisma.user.findMany();
  console.log(' Remaining users:', finalUsers);
}

main()
  .catch((e) => {
    console.error(' Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
