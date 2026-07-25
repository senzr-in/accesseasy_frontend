const fs = require('fs');
let content = fs.readFileSync('src/pages/visitors/index.vue', 'utf-8');
const lines = content.split('\n');

const recentStart = 108; 
const recentEnd = 168; 

const recordsStart = 268; 
const recordsEnd = 524; 

const quickActions = lines.slice(0, recentStart);
const recentActivity = lines.slice(recentStart, recentEnd);
const toolbar = lines.slice(recentEnd, recordsStart);
const visitorRecords = lines.slice(recordsStart + 4, recordsEnd - 1); 
const remainder = lines.slice(recordsEnd);

const newLayout = [
  ...quickActions,
  '    </div>',
  '',
  ...toolbar,
  '',
  '    <!-- Analytics Split View for Records and Recent Activity -->',
  '    <div ',
  '      v-if="activeTab === \'analytics\'"',
  '      class="flex flex-col xl:flex-row gap-4 flex-1 min-h-0 animate-in mt-2"',
  '    >',
  '      <!-- LEFT: Visitor Records Table -->',
  '      <div class="ae-card overflow-hidden flex flex-col flex-1 min-h-0 w-full min-w-0">',
  ...visitorRecords,
  '      </div>',
  '',
  '      <!-- RIGHT: Recent Activity Feed -->',
  '      <div class="w-full xl:w-[450px] flex flex-col shrink-0 min-w-0">',
  ...recentActivity.map(l => l.replace('mt-2', '')), 
  '      </div>',
  '    </div>',
  '',
  ...remainder
];

fs.writeFileSync('src/pages/visitors/index.vue', newLayout.join('\n'));
console.log('Layout successfully restructured!');

content = fs.readFileSync('src/pages/visitors/index.vue', 'utf-8');
content = content.replace('Export Today', 'Export');
fs.writeFileSync('src/pages/visitors/index.vue', content);
