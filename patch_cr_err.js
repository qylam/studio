const fs = require('fs');
const file = 'src/cloud-run-video/index.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "if (!visionId || !imageBase64) return res.status(400).send({ error: 'Missing visionId or imageBase64' });",
  "if (!visionId || !imageBase64) return res.status(400).send({ error: `Missing visionId or imageBase64. Action: ${action}, Keys received: ${Object.keys(body || {}).join(',')}` });"
);

fs.writeFileSync(file, content);
console.log('Error message patched');
