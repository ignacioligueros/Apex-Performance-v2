async function run() {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history: [], message: 'Hola' })
  });
  
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let botResponse = '';
  
  const reader = response.body.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.substring(6);
        if (dataStr === '[DONE]') {
          console.log("\nDONE RECEIVED");
          continue;
        }
        try {
          const data = JSON.parse(dataStr);
          botResponse += data.text;
          process.stdout.write(data.text);
        } catch (e) {
          console.error('\nError parsing SSE data:', e, "dataStr:", dataStr);
        }
      }
    }
  }
  console.log("\nFINAL BOT RESPONSE length:", botResponse.length);
}

run().catch(console.error);
