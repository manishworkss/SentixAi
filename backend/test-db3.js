const mariadb = require('mariadb');
require('dotenv').config();

async function test() {
  const url = process.env.DATABASE_URL;
  console.log('Testing with original url:', url);
  try {
    const pool = mariadb.createPool(url);
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
