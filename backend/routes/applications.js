const express = require('express');
const router = express.Router();
const { createApplication, getUserApplications } = require('../controllers/applicationController');
const { authenticate } = require('../middleware/auth'); // Changed protect to authenticate

router.post('/', authenticate, createApplication); // Changed protect to authenticate
router.get('/my', authenticate, getUserApplications); // Changed protect to authenticate

module.exports = router;
