const fs = require('fs');

const csv = fs.readFileSync('odoo_products_import.csv', 'utf8');
const lines = csv.split('\n').map(l => l.trim()).filter(l => l);

const newLines = [];
const oldHeaders = lines[0].match(/(\"([^\"]*)\")|([^,]+)/g).map(p => p.replace(/^\"|\"$/g, ''));
newLines.push(`"ID",` + oldHeaders.map(h => `"${h}"`).join(','));

let currentMainRow = [];
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

  if (parts[1]) {
    // Primary row (has a price)
    currentMainRow = [...parts];
    currentId = 'prod_' + parts[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
    newLines.push(`"${currentId}",` + parts.map(p => `"${p}"`).join(','));
  } else {
    // Secondary row (missing price) - copy static data from main row
    const mergedParts = [...currentMainRow]; // Copy name, price, category, tags
    
    // Replace attribute and values columns (index 4 and 5)
    mergedParts[4] = parts[4] || ''; // Attribute (Color)
    mergedParts[5] = parts[5] || ''; // Values (Red, Blue)
    
    // For Internal notes (index 6), maybe keep main row's notes
    mergedParts[6] = currentMainRow[6] || '';

    newLines.push(`"${currentId}",` + mergedParts.map(p => `"${p}"`).join(','));
  }
}

fs.writeFileSync('odoo_products_import_v4.csv', newLines.join('\n'));
console.log('Success! Created odoo_products_import_v4.csv');
