const fs = require('fs');
const file = 'src/cloud-run-video/index.js';
let content = fs.readFileSync(file, 'utf8');

const parseBodyLogic = `
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    try { body = JSON.parse(body.toString('utf8')); } catch (e) {}
  } else if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }
  body = body || {};
  const { action, visionId, imageBase64, operationId } = body;
`;

content = content.replace(
  "const { action, visionId, imageBase64, operationId } = req.body;",
  parseBodyLogic
);

fs.writeFileSync(file, content);
console.log('Body parser patched');
