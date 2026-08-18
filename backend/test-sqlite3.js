const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const libsql = createClient({ url: dbUrl });
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter, datasourceUrl: dbUrl });

async function run() {
  console.log("Testing SQLite connect...");
  try {
    const users = await prisma.user.findMany();
    console.log("Users:", users);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
