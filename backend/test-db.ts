import { db } from './src/utils/db';

async function main() {
  try {
    console.log("Connecting to DB...");
    const user = await db.user.findFirst();
    console.log("User:", user);
  } catch (error) {
    console.error("DB Error:", error);
  } finally {
    await db.$disconnect();
  }
}
main();
