const fs = require('fs');
const path = 'd:\\AccessEasy\\src\\pages\\reportAutomation\\index.vue';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/dark:[a-zA-Z0-9_/-]+/g, '');
content = content.replace(/:global\(\.dark\s*\.field-input\)[^}]+}\s*/g, '');
content = content.replace(/:global\(\.dark\)[^}]+}\s*/g, '');

fs.writeFileSync(path, content);
console.log('Done');
