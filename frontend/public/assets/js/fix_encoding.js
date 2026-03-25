
const fs = require('fs');
const path = 'c:/Users/MMM/Desktop/hackaton ai/frontend/public/assets/js/notion_fixed_final.js';

try {
    console.log('Reading file...');
    let content = fs.readFileSync(path, 'utf8');

    console.log('Replacing content...');
    // Simple string replacements
    content = content.split('âœ ï¸').join('✏️');
    content = content.split('ðŸ—‘ï¸').join('🗑️');
    content = content.split('< div').join('<div');
    content = content.split('</ div >').join('</div>');
    content = content.split('< input').join('<input');

    // Fix API path: /goals/ ${ id } -> /goals/${id}
    // We can use regex for this one or split/join if exact
    content = content.replace(/\/goals\/\s+\$\{\s+id\s+\}\s+/g, '/goals/${id}');

    console.log('Writing file...');
    fs.writeFileSync(path, content, 'utf8');
    console.log('Done.');
} catch (e) {
    console.error('ERROR:', e.message);
}
