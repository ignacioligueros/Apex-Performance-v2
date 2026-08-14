const fs = require('fs');
let code = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

code = code.replace(
  '<option value="gemini-2.0-flash">Gemini 2.0 Flash</option>',
  '<option value="gemini-3.5-flash">Gemini 3.5 Flash (Ultra Rápido)</option>'
);
code = code.replace(
  '<option value="gemini-2.5-pro">Gemini 2.5 Pro (Experto)</option>',
  ''
);

fs.writeFileSync('src/components/ChatPanel.tsx', code);
console.log("Patched ChatPanel.");
