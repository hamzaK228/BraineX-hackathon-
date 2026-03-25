/* eslint-disable */
/**
 * BraineX Backup System
 * Creates timestamped snapshots of database and data files.
 */
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = './backups';
const FILES_TO_BACKUP = ['./frontend/data/universities.json', './frontend/data/programs.json'];

function runBackup() {
  console.log('📦 Starting Backup...');

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(BACKUP_DIR, `snapshot-${timestamp}`);
  fs.mkdirSync(outDir);

  FILES_TO_BACKUP.forEach((file) => {
    const dest = path.join(outDir, path.basename(file));
    fs.copyFileSync(file, dest);
    console.log(`   - Backed up: ${file}`);
  });

  console.log(`✅ Backup saved to ${outDir}`);
}

runBackup();
