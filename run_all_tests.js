import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverRunner = path.join(__dirname, 'server', 'run_all_tests.js');

const child = spawn(process.execPath, [serverRunner], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  env: { ...process.env },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
