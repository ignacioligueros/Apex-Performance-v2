async function run() {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        history: [], 
        message: 'Hola', 
        model: 'gemini-3.5-flash',
        metrics: { title: "Test", telemetryData: [] }
      })
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text.substring(0, 100));
}
run();
