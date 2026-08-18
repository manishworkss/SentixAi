const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');
require('dotenv').config();

async function test() {
  const url = process.env.DATABASE_URL.replace(/^mysql:\/\//, 'mariadb://') + '?allowPublicKeyRetrieval=true';
  console.log('Testing with string:', url);
  try {
    const adapter = new PrismaMariaDb(url);
    console.log('Adapter created with string');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
