
import fs from 'fs';

const path = 'c:/Users/MMM/Desktop/hackaton ai/frontend/public/assets/js/notion_fixed_final.js';

console.log('Starting fix...');

try {
    let content = fs.readFileSync(path, 'utf8');

    // Mappings for replacements
    // Simple replacements for tags
    content = content.replace(/<\s+div/g, '<div');
    content = content.replace(/<\/\s+div\s+>/g, '</div>');
    content = content.replace(/<\s+input/g, '<input');

    // Fix API Path
    content = content.replace(/\/goals\/\s+\$\{\s+id\s+\}\s+/g, '/goals/${id}');

    // Fix Encoding (Mojibake) by context regex
    // Pencil
    content = content.replace(/(onclick="editResource\([^"]+\)"[^>]*>)[^<]*(<\/button>)/g, '$1✏️$2');
    content = content.replace(/(onclick="editCourse\([^"]+\)"[^>]*>)[^<]*(<\/button>)/g, '$1✏️$2');
    content = content.replace(/(onclick="editApplication\([^"]+\)"[^>]*>)[^<]*(<\/button>)/g, '$1✏️$2');
    content = content.replace(/(onclick="editScholarshipTrack\([^"]+\)"[^>]*>)[^<]*(<\/button>)/g, '$1✏️$2');

    // Trash Can
    content = content.replace(/(onclick="deleteApplication\([^"]+\)"[^>]*>)[^<]*(<\/button>)/g, '$1🗑️$2');
    content = content.replace(/(onclick="deleteScholarshipTrack\([^"]+\)"[^>]*>)[^<]*(<\/button>)/g, '$1🗑️$2');

    fs.writeFileSync(path, content, 'utf8');
    console.log('File successfully patched.');

} catch (err) {
    console.error('An error occurred:', err.message);
}
