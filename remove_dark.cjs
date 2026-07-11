const fs = require('fs');
const file = process.argv[2] || 'd:/AccessEasy/src/pages/dashboard/visitors.vue';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\s+dark:[^\s"'>]+/g, '');
fs.writeFileSync(file, content);
console.log('Removed dark classes from ' + file);
