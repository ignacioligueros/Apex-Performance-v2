import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  // Strava OAuth
  app.get('/api/strava/url', (req, res) => {
    const { redirect_uri } = req.query;
    const params = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID || '',
      redirect_uri: redirect_uri as string,
      response_type: 'code',
      scope: 'activity:read_all',
    });
    res.json({ url: `https://www.strava.com/oauth/authorize?${params.toString()}` });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    try {
      if (!code) throw new Error("No code provided");

      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) throw new Error("Failed to exchange code");
      const data = await response.json();

      res.cookie('strava_access_token', data.access_token, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (err) {
      console.error(err);
      res.status(500).send("Authentication failed");
    }
  });

  app.get('/api/strava/activities', async (req, res) => {
    const token = req.cookies.strava_access_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=15', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) return res.status(401).json({ error: "Strava token expired" });
      if (!response.ok) throw new Error("Failed to fetch activities");
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/strava/activities/:id/streams', async (req, res) => {
    const token = req.cookies.strava_access_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const response = await fetch(`https://www.strava.com/api/v3/activities/${req.params.id}/streams?keys=time,watts,heartrate,distance,altitude&key_by_type=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) return res.status(401).json({ error: "Strava token expired" });
      if (!response.ok) throw new Error("Failed to fetch streams");
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/strava/status', (req, res) => {
    const token = req.cookies.strava_access_token;
    res.json({ connected: !!token });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message, metrics, model = "gemini-3.5-flash" } = req.body;
      
      const systemInstruction = `IMPORTANTE: DEBES RESPONDER SIEMPRE Y ÚNICAMENTE EN ESPAÑOL.
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
- La fecha y hora actual es: ${new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" })}.

[DATOS DE TELEMETRÍA MÁS RECIENTES DEL USUARIO (SI EXISTEN)]
${metrics ? JSON.stringify(metrics, null, 2) : "No hay datos de telemetría recientes."}

Funciones principales:
1. Análisis de Entrenamiento: Cuando el usuario te pida analizar su entrenamiento (ej. "analiza mi sesión"), revisa los DATOS DE TELEMETRÍA adjuntos arriba. Evalúa la carga (TSS, IF), potencia y FC. Si el usuario adjunta una imagen o datos adicionales en el chat, incorpóralos al análisis.
2. Recomendaciones: Según la fatiga acumulada en la telemetría y su agenda, determina qué actividad recomendar para el día siguiente.
3. Feedback Estructurado: Al analizar un entrenamiento, usa dos secciones: "Feedback de Apex" (análisis) y "Prescripción Mañana" (recomendación).
Asegúrate de responder SIEMPRE en español.`;

      const safeHistory = (history || []).filter((h) => h.parts && h.parts[0] && h.parts[0].text && h.parts[0].text.trim().length > 0);
      const contents = [...safeHistory, { role: 'user', parts: [{ text: message }] }];

      // Normalize history to strictly alternate user/model
      const normalizedContents = [];
      for (const msg of contents) {
        if (normalizedContents.length > 0 && normalizedContents[normalizedContents.length - 1].role === msg.role) {
          normalizedContents[normalizedContents.length - 1].parts[0].text += "\n\n" + msg.parts[0].text;
        } else {
          normalizedContents.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
        }
      }

      let aiResponse;
      try {
        aiResponse = await ai.models.generateContent({
          model: model,
          contents: normalizedContents,
          config: {
            systemInstruction,
          }
        });
      } catch (err) {
        console.error(`Gemini ${model} error, trying gemini-2.5-flash fallback`, err);
        aiResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: normalizedContents,
          config: {
            systemInstruction,
          }
        });
      }
      
      res.json({ text: aiResponse.text });
    } catch (error: any) {
      console.error("Error in chat:", error);
      let errorMessage = error.message || "Failed to generate chat response";
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      } catch (e) {
        // Not JSON, keep original message
      }
      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
