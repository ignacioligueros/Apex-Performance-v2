const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
code = code.replace(
  'const [needsAuth, setNeedsAuth] = useState(true);',
  "const [needsAuth, setNeedsAuth] = useState(true);\n  const [aiModel, setAiModel] = useState('gemini-2.5-flash');"
);

// 2. Add to fetch body
code = code.replace(
  'body: JSON.stringify({ history: tempHistory, message, metrics })',
  'body: JSON.stringify({ history: tempHistory, message, metrics, model: aiModel })'
);

// 3. Add to ChatPanel props
code = code.replace(
  '<ChatPanel\n              chatHistory={chatHistory}\n              setChatHistory={setChatHistory}\n              onSendMessage={sendMessageToApex}\n              loading={loading}\n            />',
  '<ChatPanel\n              chatHistory={chatHistory}\n              setChatHistory={setChatHistory}\n              onSendMessage={sendMessageToApex}\n              loading={loading}\n              selectedModel={aiModel}\n              setSelectedModel={setAiModel}\n            />'
);

fs.writeFileSync('src/App.tsx', code);
console.log("App patched.");
