const express = require('express');
const router = express.Router();
const { analyze, getHistory, getById, parseFile, getSuggestions } = require('../controllers/analysisController');
const requireAuth = require('../middleware/requireAuth');
const requireVerified = require('../middleware/requireVerified');
const checkUsageLimit = require('../middleware/checkUsageLimit');
const { analyzeValidator, handleValidationErrors } = require('../middleware/validators');
const upload = require('../middleware/upload');

router.use(requireAuth, requireVerified); // every route below this requires login and verification

router.post('/', checkUsageLimit('analysesUsed', 5), analyzeValidator, handleValidationErrors, analyze);
router.post('/parse-file', upload.single('file'), parseFile);
router.get('/', getHistory);
router.get('/:id', getById);
router.get('/:id/suggestions', checkUsageLimit('suggestionsUsed', 5), getSuggestions);

module.exports = router;