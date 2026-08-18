const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
require('dotenv').config();

async function test() {
  const url = process.env.DATABASE_URL.replace(/^mysql:\/\//, 'mariadb://') + '?allowPublicKeyRetrieval=true';
  const adapter = new PrismaMariaDb(url);
  const prisma = new PrismaClient({ adapter });
  
  console.log('Testing query...');
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
