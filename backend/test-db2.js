const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');
require('dotenv').config();

async function test() {
  let url = process.env.DATABASE_URL.replace(/^mysql:\/\//, 'mariadb://');
  url += url.includes('?') ? '&allowPublicKeyRetrieval=true' : '?allowPublicKeyRetrieval=true';
  console.log('Testing with url:', url);
  try {
    const adapter = new PrismaMariaDb(url);
    console.log('Adapter created');
    
    const pool = mariadb.createPool(url);
    console.log('mariadb pool created manually');
    const conn = await pool.getConnection();
    console.log('connected!');
    conn.release();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
test();
