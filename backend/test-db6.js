const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
require('dotenv').config();

async function test() {
  const config = {
    host: 'localhost',
    user: 'root',
    password: 'wrong_password',
    database: 'sentix_ai'
  };
  console.log('Testing PrismaMariaDb with config object');
  try {
    const adapter = new PrismaMariaDb(config);
    console.log('Adapter created with config object');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
