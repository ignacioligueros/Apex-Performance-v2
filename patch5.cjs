const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      res.status(500).json({ error: errorMessage });
    }
  });`;

const newCode = `      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      } else {
        res.write(\`data: \${JSON.stringify({ text: "\\n[Error interno: " + errorMessage + "]" })}\\n\\n\`);
        res.write('data: [DONE]\\n\\n');
        res.end();
      }
    }
  });`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('server.ts', code);
  console.log("Patched catch block.");
} else {
  console.log("Could not find old code.");
}
