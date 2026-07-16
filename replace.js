const fs = require('fs');
const path = 'd:\\AccessEasy\\src\\pages\\dashboard\\components\\layouts\\AdminDashboard.vue';
const templatePath = 'd:\\AccessEasy\\new_template.txt';

let content = fs.readFileSync(path, 'utf8');
const newTemplate = fs.readFileSync(templatePath, 'utf8');

// The file has multiple templates (Teleport modals), but the main one ends at </template> right before <script setup>
const scriptIndex = content.indexOf('<script setup>');
if (scriptIndex !== -1) {
    const beforeScript = content.substring(0, scriptIndex);
    const scriptAndAfter = content.substring(scriptIndex);
    
    const firstTemplateIndex = beforeScript.indexOf('<template>');
    // The main template ends right before scriptAndAfter
    // We want to replace everything from the first <template> to the very last </template> in `beforeScript`.
    const lastTemplateEndIndex = beforeScript.lastIndexOf('</template>') + '</template>'.length;
    
    if (firstTemplateIndex !== -1 && lastTemplateEndIndex !== -1) {
        const newContent = beforeScript.substring(0, firstTemplateIndex) + newTemplate + '\n\n' + beforeScript.substring(lastTemplateEndIndex) + scriptAndAfter;
        fs.writeFileSync(path, newContent, 'utf8');
        console.log('Template replaced successfully!');
    } else {
        console.log('Could not find template boundaries');
    }
} else {
    console.log('Could not find script setup');
}
