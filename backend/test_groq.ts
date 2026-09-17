import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function run() {
  try {
    const models = await groq.models.list();
    console.log(models.data.map(m => m.id).join(', '));
  } catch (e) {
    console.error(e);
  }
}
run();
