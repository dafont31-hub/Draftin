
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const docsDir = './DOCUMENTOS MANUALES';
const outputFile = './src/knowledge_base.json';

async function extractText() {
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.pdf'));
    const knowledgeBase = [];

    console.log(`Starting extraction of ${files.length} files using CLI...`);

    for (const file of files) {
        const filePath = path.join(docsDir, file);
        console.log(`Extracting: ${file}`);
        try {
            // Using the CLI to extract text
            const text = execSync(`npx pdf-parse text "${filePath}"`, { encoding: 'utf8' });
            
            // Clean text a bit
            const cleanText = text
                .replace(/\n\s*\n/g, '\n') // Remove empty lines
                .replace(/\s+/g, ' ')      // Collapse whitespace
                .trim();

            knowledgeBase.push({
                filename: file,
                content: cleanText.substring(0, 50000) // Cap to 50k chars per file
            });
            console.log(`Successfully extracted ${cleanText.length} characters from ${file}`);
        } catch (err) {
            console.error(`Error extracting ${file}:`, err.message);
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(knowledgeBase, null, 2));
    console.log(`Knowledge base saved to ${outputFile}`);
}

extractText();
