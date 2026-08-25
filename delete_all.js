const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.keyword.deleteMany();
  await prisma.monitoredSource.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();
  console.log("Deleted all records");
}
run().finally(() => prisma.$disconnect());
