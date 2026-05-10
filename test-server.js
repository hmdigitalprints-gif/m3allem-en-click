import { spawn } from 'child_process';
const server = spawn('npm', ['run', 'dev']);
server.stdout.on('data', data => process.stdout.write(`stdout: ${data}`));
server.stderr.on('data', data => process.stderr.write(`stderr: ${data}`));
setTimeout(() => { server.kill(); }, 4000);
