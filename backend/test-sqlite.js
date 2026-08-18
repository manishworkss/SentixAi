const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
async function run() {
  console.log("Testing SQLite connect...");
  const users = await prisma.user.findMany();
  console.log("Users:", users);
}
run();
