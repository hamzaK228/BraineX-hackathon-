console.log('--- DEBUG START ---');
try {
  require('./backend/config/database');
  console.log('✅ database ok');
} catch (e) {
  console.error('❌ database fail', e.message);
}
try {
  require('./backend/models/User');
  console.log('✅ User model ok');
} catch (e) {
  console.error('❌ User model fail', e.message);
}
try {
  require('./backend/utils/emailService');
  console.log('✅ emailService ok');
} catch (e) {
  console.error('❌ emailService fail', e.message);
}
try {
  require('./backend/controllers/authController');
  console.log('✅ authController ok');
} catch (e) {
  console.error('❌ authController fail', e.message);
}
try {
  require('./backend/routes/auth');
  console.log('✅ auth routes ok');
} catch (e) {
  console.error('❌ auth routes fail', e.message);
}
try {
  require('./backend/routes/scholarships');
  console.log('✅ scholarships routes ok');
} catch (e) {
  console.error('❌ scholarships routes fail', e.message);
}
try {
  require('./backend/routes/mentors');
  console.log('✅ mentors routes ok');
} catch (e) {
  console.error('❌ mentors routes fail', e.message);
}
try {
  require('./backend/routes/fields');
  console.log('✅ fields routes ok');
} catch (e) {
  console.error('❌ fields routes fail', e.message);
}
try {
  require('./backend/routes/events');
  console.log('✅ events routes ok');
} catch (e) {
  console.error('❌ events routes fail', e.message);
}
try {
  require('./backend/routes/applications');
  console.log('✅ applications routes ok');
} catch (e) {
  console.error('❌ applications routes fail', e.message);
}
try {
  require('./backend/routes/admin');
  console.log('✅ admin routes ok');
} catch (e) {
  console.error('❌ admin routes fail', e.message);
}
console.log('--- DEBUG END ---');
