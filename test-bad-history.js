async function run() {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        history: [
            { role: 'user', parts: [{ text: 'Hola 1' }] },
            { role: 'user', parts: [{ text: 'Hola 2' }] }
        ], 
        message: 'Hola 3', 
        model: 'gemini-3.5-flash' 
      })
    });
    
    console.log("Status:", response.status);
    if (!response.ok) {
        console.log("Text:", await response.text());
        return;
    }

    const decoder = new TextDecoder('utf-8');
    const reader = response.body.getReader();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      for (const line of lines) {
          const l = line.trim();
          if (l.startsWith('data:')) {
            const dataStr = l.substring(5).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              process.stdout.write(data.text);
            } catch (e) {}
          }
      }
    }
  } catch (e) {
      console.log(e);
  }
}
run();
