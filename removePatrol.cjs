const fs = require('fs');
const file = 'src/pages/dashboard/components/layouts/AdminDashboard.vue';
const lines = fs.readFileSync(file, 'utf-8').split('\n');

const keepLine = Array(lines.length).fill(true);

for(let i=17; i<=37; i++) keepLine[i] = false;
for(let i=41; i<=92; i++) keepLine[i] = false;
for(let i=317; i<=1076; i++) keepLine[i] = false;

const newLines = lines.filter((_, i) => keepLine[i]);

const searchStr = 'v-if="activeSection === ' + "'" + 'visitor' + "'" + '"';

for(let i=0; i<newLines.length; i++) {
  if (newLines[i].includes(searchStr)) {
    newLines[i] = newLines[i].replace(searchStr, '');
  }
}

fs.writeFileSync(file, newLines.join('\n'));
console.log('Removed blocks successfully.');
