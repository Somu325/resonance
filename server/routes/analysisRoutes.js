const express = require('express');
const router = express.Router();
const { analyze, getHistory, getById, parseFile } = require('../controllers/analysisController');
const requireAuth = require('../middleware/requireAuth');
const { analyzeValidator, handleValidationErrors } = require('../middleware/validators');
const upload = require('../middleware/upload');

router.use(requireAuth); // every route below this requires login

router.post('/', analyzeValidator, handleValidationErrors, analyze);
router.post('/parse-file', upload.single('file'), parseFile);
router.get('/', getHistory);
router.get('/:id', getById);

module.exports = router;