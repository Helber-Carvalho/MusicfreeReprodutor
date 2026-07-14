const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'middleware',
  'ManifestMiddleware.js'
);

try {
  let content = fs.readFileSync(filePath, 'utf8');
  const search = `// Hermes doesn't support more modern JS features than most, if not all, modern browser.\n            engine: 'hermes',`;
  const replace = `// Web does not use Hermes\n            engine: undefined,`;
  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched ManifestMiddleware.js to disable Hermes on web');
  } else if (content.includes(replace)) {
    console.log('ManifestMiddleware.js already patched');
  } else {
    console.warn('Could not find Hermes engine setting in ManifestMiddleware.js');
  }
} catch (err) {
  console.error('Failed to patch ManifestMiddleware.js:', err.message);
}
