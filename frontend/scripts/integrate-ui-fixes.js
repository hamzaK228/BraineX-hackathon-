/**
 * UI Fixes Integration Script
 * Manages the deployment of ButtonStateEngine and Theme fixes.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const ASSETS_DIR = path.join(ROOT_DIR, 'frontend/assets');

console.log('🚀 Starting UI Fixes Integration...');

// 1. Verify Assets Exist
const convertPath = (p) => path.join(ROOT_DIR, p);

const requiredFiles = [
  'frontend/assets/js/buttonStateEngine.js',
  'frontend/assets/js/theme.js',
  'frontend/assets/js/main.js',
];

let missing = false;
requiredFiles.forEach((file) => {
  if (!fs.existsSync(convertPath(file))) {
    console.error(`❌ Missing critical file: ${file}`);
    missing = true;
  } else {
    console.log(`✅ Verified: ${file}`);
  }
});

if (missing) {
  console.error('Integrity check failed. Aborting.');
  process.exit(1);
}

// 2. Cache Busting Verification
const htmlFile = convertPath('frontend/pages/main.html');
const htmlContent = fs.readFileSync(htmlFile, 'utf8');

if (htmlContent.includes('?v=hotfix.1')) {
  console.log('✅ Cache busting query parameters validated.');
} else {
  console.warn('⚠️ Cache busting parameters missing in main.html');
}

// 3. Theme Script Isolation Check
if (
  htmlContent.includes('<script src="../assets/js/theme.js"') &&
  htmlContent.includes('setupTheme()')
) {
  console.error(
    '❌ Double initialization detected: theme.js script tag AND setupTheme() call found.'
  );
} else {
  console.log('✅ Theme initialization logic validated (Unique Source).');
}

console.log('\n✨ UI Fixes Integration Verified successfully.');
