const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove isBoulderOpen
code = code.replace(/  \/\/ Boulder Modal State\n  const \[isBoulderOpen, setIsBoulderOpen\] = useState\(false\);\n/, '');

// Remove handleManualBoulderSubmit
code = code.replace(/  const handleManualBoulderSubmit = async \(notes: string\) => {\n    const message = `He realizado una sesión de escalada \(boulder\). Aquí están mis notas, sensaciones y cargas de dedos:\\n\\n\${notes}`;\n    sendMessageToApex\(message\);\n  };\n/, '');

// Remove onOpenBoulderModal props
code = code.replace(/        onOpenBoulderModal=\{\(\) => setIsBoulderOpen\(true\)\}\n/, '');
code = code.replace(/              onOpenBoulderModal=\{\(\) => setIsBoulderOpen\(true\)\}\n/, '');

// Remove BoulderModal component
code = code.replace(/      \{\/\* Boulder Log Modal \*\/}[\s\S]*?<BoulderModal[\s\S]*?\/>\n/, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
