const fs = require('fs');
const path = 'd:\\AccessEasy\\src\\pages\\reportAutomation\\index.vue';
let content = fs.readFileSync(path, 'utf8');

// Strip all dark: classes correctly without breaking vue bindings
content = content.replace(/\bdark:[a-zA-Z0-9_:-]+\b/g, '');
// Strip global dark styles
content = content.replace(/:global\(\.dark[^\)]*\)\s*{[^}]*}/g, '');
// Replace extra spaces
content = content.replace(/  +/g, ' ');

fs.writeFileSync(path, content);
console.log('Done');
