const str = "data: {\"text\":\"a\"}\r\n\r\ndata: {\"text\":\"b\"}\n\n";
let buffer = str;
const lines = buffer.split('\n');
console.log(lines);
for (const line of lines) {
  let l = line.trim();
  if (l.startsWith('data:')) {
    let dataStr = l.substring(5).trim();
    console.log("dataStr:", dataStr);
  }
}
