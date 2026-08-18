const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');
require('dotenv').config();

async function test() {
  const url = process.env.DATABASE_URL.replace(/^mysql:\/\//, 'mariadb://');
  console.log('Testing with original url:', url);
  try {
    const pool = mariadb.createPool(url);
    const adapter = new PrismaMariaDb(pool);
    console.log('Adapter created with pool');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
