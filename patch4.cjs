const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-transform, no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      let stream;
      try {
        stream = await ai.models.generateContentStream({
          model: model,
          contents,
          config: {
            systemInstruction,
          }
        });
      } catch (err) {
        console.error(\`Gemini \${model} error, trying gemini-1.5-flash fallback\`, err);
        stream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction,
          }
        });
      }`;

const newCode = `      // Normalize history to strictly alternate user/model
      const normalizedContents = [];
      for (const msg of contents) {
        if (normalizedContents.length > 0 && normalizedContents[normalizedContents.length - 1].role === msg.role) {
          normalizedContents[normalizedContents.length - 1].parts[0].text += "\\n\\n" + msg.parts[0].text;
        } else {
          normalizedContents.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
        }
      }

      let stream;
      try {
        stream = await ai.models.generateContentStream({
          model: model,
          contents: normalizedContents,
          config: {
            systemInstruction,
          }
        });
      } catch (err) {
        console.error(\`Gemini \${model} error, trying gemini-2.5-flash fallback\`, err);
        stream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents: normalizedContents,
          config: {
            systemInstruction,
          }
        });
      }

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-transform, no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('server.ts', code);
  console.log("Patched headers and history normalization.");
} else {
  console.log("Could not find old code.");
}
