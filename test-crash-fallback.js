async function run() {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: [], message: 'Hola', model: 'invalid-model' })
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text);
}
run();
