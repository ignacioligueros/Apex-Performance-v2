const str = "data: {\"text\":\"¡Hola, Ignacio! Qué bueno saludarte por acá. \\n\\nHoy es\"}\n\ndata: {\"text\":\" jueves, así que me imagino que estás en pleno *home office* y ya visualizando la sesión de boulder de esta\"}\n\ndata: {\"text\":\" noche (de 20:00 a 22:00) para ir a medir esa fuerza de\"}\n\ndata: {\"text\":\" dedos con el Tindeq. \\n\\nCuéntame, ¿cómo te has sentido últimamente? ¿Quieres que analicemos alguna\"}\n\ndata: {\"text\":\" sesión de ruta o rodillo, planifiquemos la semana, o veamos algo de tu nutrición? ¡D\"}\n\ndata: {\"text\":\"ime en qué estás y le damos!\"}\n\ndata: [DONE]\n\n";

let buffer = str;
const lines = buffer.split(/\r?\n/);
buffer = lines.pop() || '';
for (const line of lines) {
  const l = line.trim();
  if (l.startsWith('data:')) {
    const dataStr = l.substring(5).trim();
    if (dataStr === '[DONE]') {
      continue;
    }
    try {
      const data = JSON.parse(dataStr);
      console.log("Parsed:", data.text);
    } catch (e) {
      console.error('Error parsing SSE data:', e, 'Data:', dataStr);
    }
  }
}
