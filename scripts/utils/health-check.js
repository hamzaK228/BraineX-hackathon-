/* eslint-disable */
/**
 * BraineX Health Check Script
 * Validates critical system files and data connectivity.
 */
const fs = require('fs');
const path = require('path');

const checks = [
  { name: 'Universities Data', path: './frontend/data/universities.json' },
  { name: 'Programs Data', path: './frontend/data/programs.json' },
  { name: 'Design System', path: './frontend/assets/css/design-system.css' },
  { name: 'Main Entry', path: './frontend/pages/main.html' },
];

console.log('🔍 Running Health Checks...');

let failed = false;
checks.forEach((check) => {
  if (fs.existsSync(check.path)) {
    console.log(`✅ ${check.name}: OK`);
  } else {
    console.log(`❌ ${check.name}: MISSING (${check.path})`);
    failed = true;
  }
});

if (failed) {
  console.error('⚠️ Health checks failed! Build in unstable state.');
  process.exit(1);
} else {
  console.log('✨ All systems healthy.');
}
