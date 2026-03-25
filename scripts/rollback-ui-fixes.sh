#!/bin/bash
# rollback-ui-fixes.sh
echo "🔄 Rolling back BraineX UI fixes..."
echo "Current commit: $(git log --oneline -1)"

# Create backup of current state
git stash save "pre-rollback-backup-$(date +%Y%m%d_%H%M%S)"

# Rollback
git reset --hard HEAD~1
git push -f origin main

echo "✅ Rollback complete"
echo "Previous commit restored: $(git log --oneline -1)"
echo "Backup saved in stash. Use 'git stash list' to view."
