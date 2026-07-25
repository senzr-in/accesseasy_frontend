const fs = require('fs');
const content = fs.readFileSync('src/pages/visitors/index.vue', 'utf-8');
const templateStr = content.substring(content.indexOf('<template>'), content.indexOf('</template>'));
const lines = templateStr.split('\n');
const stack = [];

lines.forEach((line, i) => {
  const matches = line.match(/<\/?([a-zA-Z0-9-]+)[^>]*>/g);
  if (matches) {
    matches.forEach(match => {
      const isSelfClosing = match.endsWith('/>');
      const isClosing = match.startsWith('</');
      const tagNameMatch = match.match(/<\/?([a-zA-Z0-9-]+)/);
      if (!tagNameMatch) return;
      const tagName = tagNameMatch[1];
      const voidElements = ['input', 'img', 'br', 'hr', 'meta', 'link', 'path', 'circle', 'line', 'polyline', 'rect', 'Teleport', 'component']; // Teleport, component aren't void but let's ignore them for a moment? No wait, Teleport and component need closing.
      
      if (voidElements.includes(tagName) || isSelfClosing) return;

      if (isClosing) {
        if (stack.length === 0 || stack[stack.length - 1].tagName !== tagName) {
          console.log(`Mismatch at line ${i+1}: Expected ${stack.length > 0 ? stack[stack.length-1].tagName : 'nothing'} but found ${tagName}`);
          console.log(`  Stack top opened at line: ${stack.length > 0 ? stack[stack.length-1].line : 'N/A'}`);
          console.log(`  Content: ${line.trim()}`);
        } else {
          stack.pop();
        }
      } else {
        stack.push({ tagName, line: i+1 });
      }
    });
  }
});

console.log('Unclosed elements:', stack);
