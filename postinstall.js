const path = require('path');
const child_process = require('child_process');

const pkgPath = path.join(__dirname, 'node_modules', 'transmission-rpc-client');
const cmd = `babel ${pkgPath} --out-dir ${pkgPath} --copy-files`;

child_process.execSync(cmd, { stdio: 'inherit' });