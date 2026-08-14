const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldStreamLogic = `      let stream;
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
      res.flushHeaders();

      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(\`data: \${JSON.stringify({ text: chunk.text })}\\n\\n\`);
          if (typeof res.flush === 'function') {
            res.flush();
          }
        }
      }

      res.write('data: [DONE]\\n\\n');
      res.end();`;

const newJSONLogic = `      let aiResponse;
      try {
        aiResponse = await ai.models.generateContent({
          model: model,
          contents: normalizedContents,
          config: {
            systemInstruction,
          }
        });
      } catch (err) {
        console.error(\`Gemini \${model} error, trying gemini-2.5-flash fallback\`, err);
        aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: normalizedContents,
          config: {
            systemInstruction,
          }
        });
      }

      res.json({ text: aiResponse.text });`;

code = code.replace(oldStreamLogic, newJSONLogic);

const oldErrorLogic1 = `      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      } else {
        res.write(\`data: \${JSON.stringify({ text: "\\n[Error interno: " + errorMessage + "]" })}\\n\\n\`);
        res.write('data: [DONE]\\n\\n');
        res.end();
      }`;

const newErrorLogic1 = `      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      }`;

code = code.replace(oldErrorLogic1, newErrorLogic1);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
