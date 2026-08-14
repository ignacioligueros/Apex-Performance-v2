async function run() {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history: [], message: 'Hola' })
  });
  
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  const reader = response.body.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    console.log(`\n--- CHUNK RECEIVED (size: ${value.length}) ---`);
    buffer += decoder.decode(value, { stream: true });
    
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.substring(6);
        if (dataStr === '[DONE]') continue;
        const data = JSON.parse(dataStr);
        process.stdout.write(data.text);
      }
    }
  }
}

run().catch(console.error);
