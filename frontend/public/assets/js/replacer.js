
const fs = require('fs');
const path = 'c:/Users/MMM/Desktop/hackaton ai/frontend/public/assets/js/notion_fixed_final.js';

console.log('Starting fix...');

try {
    let content = fs.readFileSync(path, 'utf8');

    // Mappings for replacements
    const replacements = [
        // Fix Tag Spacing
        { search: /<\s+div/g, replace: '<div' },
        { search: /<\/\s+div\s+>/g, replace: '</div>' },
        { search: /<\s+input/g, replace: '<input' },

        // Fix API Path
        { search: /\/goals\/\s+\$\{\s+id\s+\}\s+/g, replace: '/goals/${id}' },

        // Fix Encoding (Mojibake) by context
        // Pencil
        { search: /(onclick="editResource\([^"]+\)"[^>]*>).*?(<\/button>)/g, replace: '$1✏️$2' },
        { search: /(onclick="editCourse\([^"]+\)"[^>]*>).*?(<\/button>)/g, replace: '$1✏️$2' },
        { search: /(onclick="editApplication\([^"]+\)"[^>]*>).*?(<\/button>)/g, replace: '$1✏️$2' },
        { search: /(onclick="editScholarshipTrack\([^"]+\)"[^>]*>).*?(<\/button>)/g, replace: '$1✏️$2' },

        // Trash Can
        { search: /(onclick="deleteApplication\([^"]+\)"[^>]*>).*?(<\/button>)/g, replace: '$1🗑️$2' },
        { search: /(onclick="deleteScholarshipTrack\([^"]+\)"[^>]*>).*?(<\/button>)/g, replace: '$1🗑️$2' }
    ];

    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });

    fs.writeFileSync(path, content, 'utf8');
    console.log('File successfully patched.');

} catch (err) {
    console.error('An error occurred:', err.message);
}
