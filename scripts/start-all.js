const { spawn } = require('child_process');
const path = require('path');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [
  spawn(npm, ['start'], { cwd: path.resolve(__dirname, '..', 'backend'), stdio: 'inherit', shell: process.platform === 'win32' }),
  spawn(npm, ['start'], { cwd: path.resolve(__dirname, '..', 'frontend'), stdio: 'inherit', shell: process.platform === 'win32' })
];

const stop = () => processes.forEach(child => child.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
processes.forEach(child => child.on('exit', code => {
  if (code && code !== 0) process.exitCode = code;
}));
