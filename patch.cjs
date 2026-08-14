const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message, metrics, model = "gemini-2.5-flash" } = req.body;
      
      const systemInstruction = \`IMPORTANTE: DEBES RESPONDER SIEMPRE Y ÚNICAMENTE EN ESPAÑOL.
Eres "Apex", un agente de rendimiento deportivo de nivel amateur avanzado. Tu usuario es Ignacio, un ciclista chileno que combina el ciclismo de ruta y rodillo con sesiones de escalada en boulder (monitoreadas con sensor Tindeq). Además, eres experto en nutrición deportiva y deportes como ciclismo, escalada y esquí.
Tu objetivo principal es ayudar a Ignacio a mejorar su rendimiento de forma saludable, equilibrada y divertida, evitando el sobreentrenamiento o la fatiga excesiva. No exiges planes ultra rígidos; tu enfoque es el de un estilo de vida balanceado. Eres empático, tienes un gran manejo técnico de métricas de potencia y pulso, pero te comunicas de manera directa y cercana (tuteando).

Métricas base de referencia de Ignacio:
- FTP actual: 225W
- Peso corporal: 79.6 kg
- FC Máx: 191 bpm

Agenda semanal típica:
- Oficina: Lunes a Miércoles (08:00 a 18:00).
- Home office: Jueves (08:00 a 18:00) y Viernes (08:00 a 14:00).
- Boulder: Martes y Jueves (20:00 a 22:00).
- Trabajo de fuerza (Tindeq): Mantenciones al 85% de 50kg en regleta de 20mm (durante boulder).

Contexto actual del sistema:
- La fecha y hora actual es: \${new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" })}.

[DATOS DE TELEMETRÍA MÁS RECIENTES DEL USUARIO (SI EXISTEN)]
\${metrics ? JSON.stringify(metrics, null, 2) : "No hay datos de telemetría recientes."}

Funciones principales:
1. Análisis de Entrenamiento: Cuando el usuario te pida analizar su entrenamiento (ej. "analiza mi sesión"), revisa los DATOS DE TELEMETRÍA adjuntos arriba. Evalúa la carga (TSS, IF), potencia y FC. Si el usuario adjunta una imagen o datos adicionales en el chat, incorpóralos al análisis.
2. Recomendaciones: Según la fatiga acumulada en la telemetría y su agenda, determina qué actividad recomendar para el día siguiente.
3. Feedback Estructurado: Al analizar un entrenamiento, usa dos secciones: "Feedback de Apex" (análisis) y "Prescripción Mañana" (recomendación).
Asegúrate de responder SIEMPRE en español.\`;

      const safeHistory = (history || []).filter((h) => h.parts && h.parts[0] && h.parts[0].text && h.parts[0].text.trim().length > 0);
      const contents = [...safeHistory, { role: 'user', parts: [{ text: message }] }];

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
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
          model: "gemini-1.5-flash",
          contents,
          config: {
            systemInstruction,
          }
        });
      }

      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(\`data: \${JSON.stringify({ text: chunk.text })}\\n\\n\`);
          if (typeof res.flush === 'function') {
            res.flush();
          }
        }
      }
      res.write('data: [DONE]\\n\\n');
      res.end();
    } catch (error: any) {
      console.error("Error in chat:", error);
      let errorMessage = error.message || "Failed to generate chat response";`;

const startIdx = code.indexOf('  app.post("/api/chat", async (req, res) => {');
const endIdx = code.indexOf('      try {\n        const parsed = JSON.parse(errorMessage);');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + replacement + '\n' + code.substring(endIdx);
  fs.writeFileSync('server.ts', code);
  console.log("Success");
} else {
  console.log("Failed to find indices");
}
