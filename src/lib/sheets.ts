export async function fetchSheetData(spreadsheetId: string, range: string, accessToken?: string) {
  // Use public CSV export to bypass auth requirements for published sheets
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Sheets CSV Fetch Error:', response.status, errorText);
    throw new Error(`Failed to fetch data from Google Sheets (${response.status}). Asegúrate de que el Sheet sea público o esté publicado en la web.`);
  }
  
  const csvText = await response.text();
  
  // Basic CSV parser
  const rows = csvText.split('\n').map(row => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });
  
  // Filter out empty rows
  return rows.filter(row => row.some(cell => cell !== ''));
}
