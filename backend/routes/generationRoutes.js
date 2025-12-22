const express = require('express');
const router = express.Router();
const { generateImage } = require('../controllers/imageGenerationController');

router.post('/image', generateImage);

module.exports = router;