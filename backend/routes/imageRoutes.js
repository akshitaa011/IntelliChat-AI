const express = require('express');
const router = express.Router();
const { analyzeImage } = require('../controllers/imageAnalysisController');

router.post('/analyze', analyzeImage);

module.exports = router;