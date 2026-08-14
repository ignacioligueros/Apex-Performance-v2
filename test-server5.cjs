const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: 'Hola'
    });
    for await (const chunk of stream) {
      console.log(chunk.text);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
