import * as fs from 'fs';
import * as path from 'path';
import { run } from './engine';

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: npx tsx src/cli.ts <path-to-dza-file>');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const source = fs.readFileSync(filePath, 'utf-8');
  console.log(`[DZA CLI] Running ${path.basename(filePath)}...\n`);

  const result = run(source, {
    onPrint: (text) => console.log(text)
  });

  if (result.error) {
    console.error(`\n[DZA Error] ${result.error.message}`);
    console.error(`At line ${result.error.line}, column ${result.error.column}`);
    process.exit(1);
  }

  console.log(`\n[DZA CLI] Execution completed.`);
}

main();
