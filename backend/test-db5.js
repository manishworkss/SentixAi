const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function test() {
  console.log('Testing native Prisma with url:', process.env.DATABASE_URL);
  try {
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst();
    console.log('connected! User:', user);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
