import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to handle relative paths in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use relative paths to make it work in any environment (local or Vercel build)
const csvPath = path.join(__dirname, '../motocicletas_dataset/Motorcycle Data export 2026-05-10 21-34-17.csv');
const targetPath = path.join(__dirname, '../motocicletas_dataset/motorcycles.json');

const content = fs.readFileSync(csvPath, 'utf8');

const dataset = {};

// Improved CSV parser that handles multi-line fields
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // End of quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentRow.length > 0 || currentField !== '') {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

console.log('Parsing CSV...');
const rows = parseCSV(content);
console.log(`Parsed ${rows.length} potential rows.`);

// Skip header row
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (row.length < 2) continue;

  const fullName = row[1].trim();
  if (!fullName || fullName === 'Model') continue;

  // Heuristic for brand extraction
  const multiWordBrands = [
    'Moto Guzzi', 'Royal Enfield', 'MV Agusta', 'Harley-Davidson',
    'Indian Motorcycle', 'Norton Motorcycles', 'Triumph Motorcycles',
    'Arctic Cat', 'Can-Am', 'CF Moto', 'Hyosung', 'KTM', 'Kymco'
  ];

  let brand = '';
  let model = '';

  const matchedMultiWord = multiWordBrands.find(b => fullName.startsWith(b));
  if (matchedMultiWord) {
    brand = matchedMultiWord;
    model = fullName.substring(matchedMultiWord.length).trim();
  } else {
    const parts = fullName.split(' ');
    brand = parts[0];
    model = parts.slice(1).join(' ').trim();
  }

  // Final cleanup: if brand is just a number or weird symbol, skip
  if (/^[\d,.-]+$/.test(brand) || brand.length < 2) continue;

  if (!dataset[brand]) {
    dataset[brand] = new Set();
  }
  if (model) {
    dataset[brand].add(model);
  } else {
    dataset[brand].add(brand);
  }
}

const finalDataset = {};
for (const brand in dataset) {
  finalDataset[brand] = Array.from(dataset[brand]).sort();
}

fs.writeFileSync(targetPath, JSON.stringify(finalDataset, null, 2), 'utf8');

console.log('Dataset regenerated successfully at ' + targetPath);
console.log('Unique brands found:', Object.keys(finalDataset).length);
