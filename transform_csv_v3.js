const fs = require('fs');

const csv = fs.readFileSync('odoo_products_import.csv', 'utf8');
const lines = csv.split('\n').map(l => l.trim()).filter(l => l);

const newLines = [];
// Parse headers and add ID
const oldHeaders = lines[0].match(/(\"([^\"]*)\")|([^,]+)/g).map(p => p.replace(/^\"|\"$/g, ''));
newLines.push(`"ID",` + oldHeaders.map(h => `"${h}"`).join(','));

let currentId = '';

for (let i = 1; i < lines.length; i++) {
  const parts = [];
  let inQuotes = false;
  let currentPart = '';
  for (let j = 0; j < lines[i].length; j++) {
    const char = lines[i][j];
    if (char === '\"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(currentPart);
      currentPart = '';
    } else {
      currentPart += char;
    }
  }
  parts.push(currentPart);

  // If this row has a price, it's a primary row. Generate a new ID.
  if (parts[1]) {
    // Generate a simple ID from the name
    currentId = 'prod_' + parts[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
  }
  
  // Re-encode the row with the ID prepended
  newLines.push(`"${currentId}",` + parts.map(p => `"${p}"`).join(','));
}

fs.writeFileSync('odoo_products_import_v3.csv', newLines.join('\n'));
console.log('Success! Created odoo_products_import_v3.csv');
