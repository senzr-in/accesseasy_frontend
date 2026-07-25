const fs = require('fs');
const content = fs.readFileSync('src/pages/visitors/index.vue', 'utf-8');
const lines = content.split('\n');

const toolbarEnd = lines.findIndex(l => l.includes('<!-- Analytics Split View for Records and Recent Activity -->'));
const tableHeader = lines.findIndex(l => l.includes('<!-- Table Header -->'));
const pendingStart = lines.findIndex(l => l.includes('<!-- Pending Approvals Grid View -->'));
const recentActivityStart = lines.findIndex(l => l.includes('<!-- RIGHT: Recent Activity Feed -->'));
const registrationModal = lines.findIndex(l => l.includes('<!-- Registration Modal -->'));

console.log('toolbarEnd:', toolbarEnd);
console.log('tableHeader:', tableHeader);
console.log('pendingStart:', pendingStart);
console.log('recentActivityStart:', recentActivityStart);
console.log('registrationModal:', registrationModal);

const topPart = lines.slice(0, toolbarEnd);

const visitorRecordsInner = lines.slice(tableHeader, pendingStart);
// visitorRecordsInner has some trailing </div>s that were meant to close the ae-card. Let's inspect it later.

const pendingAndPortals = lines.slice(pendingStart, recentActivityStart);

const bottomPart = lines.slice(registrationModal);

// Reconstruct
const newLines = [
  ...topPart,
  '    <!-- Visitor Records Table -->',
  '    <div ',
  '      v-if="activeTab === \'analytics\'"',
  '      class="ae-card overflow-hidden flex flex-col flex-1 min-h-0 animate-in mt-2"',
  '    >',
  ...visitorRecordsInner,
  ...pendingAndPortals,
  ...bottomPart
];

fs.writeFileSync('src/pages/visitors/index.vue.fixed', newLines.join('\n'));
console.log('Created index.vue.fixed');
