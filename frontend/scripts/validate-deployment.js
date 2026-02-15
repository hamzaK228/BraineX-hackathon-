// frontend/scripts/validate-deployment.js
async function validateUIFixes() {
  console.log('🔍 Validating UI Fixes Deployment...');

  const tests = {
    themeToggle: () => localStorage.getItem('brainex_theme') !== null, // Fixed key name
    buttonEngine: () => typeof ButtonStateEngine === 'function',
    authState: () => typeof updateUIForUser === 'function', // Check global or authAPI
    forms: () => document.querySelectorAll('form').length > 0,
  };

  let passed = 0;
  let total = Object.keys(tests).length;

  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      const result = testFn();
      console.log(`${result ? '✅' : '❌'} ${testName}: ${result ? 'PASS' : 'FAIL'}`);
      if (result) passed++;
    } catch (error) {
      console.log(`❌ ${testName}: ERROR - ${error.message}`);
    }
  }

  console.log(`📊 Results: ${passed}/${total} tests passed`);
  return passed === total;
}

// Run validation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', validateUIFixes);
} else {
  validateUIFixes();
}
