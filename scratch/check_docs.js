
import fs from 'fs';
import { execSync } from 'child_process';

const docsDir = 'DOCUMENTOS MANUALES';
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.pdf'));

console.log(`Found ${files.length} PDFs. Attempting to extract text...`);

// We'll try to use a common tool if available or just list them.
files.forEach(file => {
    console.log(`Processing: ${file}`);
    // Since we don't have a parser, we can't do much here without installing one.
});
