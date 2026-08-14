const fs = require('fs');
let code = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

const oldForm = `<form onSubmit={handleSubmit} className="flex gap-2">`;
const newForm = `<div className="flex gap-2">`;
const oldFormClose = `</form>`;
const newFormClose = `</div>`;

code = code.replace(oldForm, newForm);
code = code.replace(oldFormClose, newFormClose);

const oldInput = `          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 bg-[#090d14] text-slate-100 placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500 text-xs sm:text-sm transition-all"
            disabled={loading}
          />`;
const newInput = `          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
            placeholder="Type your question here..."
            className="flex-1 bg-[#090d14] text-slate-100 placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500 text-xs sm:text-sm transition-all"
            disabled={loading}
          />`;

code = code.replace(oldInput, newInput);

const oldButton = `          <button
            type="submit"`;
const newButton = `          <button
            type="button"
            onClick={handleSubmit}`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('src/components/ChatPanel.tsx', code);
console.log("Patched ChatPanel form to div.");
