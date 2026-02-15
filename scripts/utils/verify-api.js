/* eslint-disable no-process-exit */
import http from 'http';

const endpoints = [
  '/api/health',
  '/api/scholarships',
  '/api/programs',
  '/api/events',
  '/api/universities',
  '/api/fields',
  '/api/projects',
  '/api/roadmaps',
];

let pending = endpoints.length;

console.log('🚀 Starting API Verification Check...');

endpoints.forEach((path) => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: path,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const status =
          res.statusCode === 200 && (json.success === true || Array.isArray(json))
            ? '✅ PASS'
            : '❌ FAIL';
        console.log(
          `${status} ${path} (${res.statusCode}) - ${json.count ? json.count + ' items' : 'OK'}`
        );
        if (res.statusCode !== 200) console.log('Response:', data.substring(0, 200));
      } catch (error) {
        console.log(`❌ FAIL ${path} (${res.statusCode}) - Invalid JSON`);
        console.log('Raw:', data.substring(0, 200));
      }
      checkDone();
    });
  });

  req.on('error', (_error) => {
    console.log(`❌ FAIL ${path} - Connection Refused`);
    checkDone();
  });

  req.end();
});

function checkDone() {
  pending--;
  if (pending === 0) {
    console.log('\n🏁 Verification Complete');
    process.exit(0);
  }
}
