const Analysis = require('../models/Analysis');
const User = require('../models/User');
const { analyzeResume, extractJDSkills, matchSkills, generateVerdict, generateSuggestions } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const { parseFile: parseFileService } = require('../services/fileParserService');

const analyze = asyncHandler(async (req, res) => {
  const { resumeText, jdText, resumeSource } = req.body;

  if (!resumeText || !jdText) {
    return res.status(400).json({ message: 'Resume text and JD text are required' });
  }

  const { resumeAnalysis, provider: resumeProvider } = await analyzeResume(resumeText);

  // Note: extractionConfidence (e.g. 'low') is read from resumeAnalysis and saved to the database.
  // This signal flows directly to the frontend to display an appropriate disclaimer on the Results page.
  if (resumeAnalysis.extractionConfidence === 'low') {
    console.warn('Low resume extraction confidence reported by AI.');
  }

  const { jdSkills, provider: jdProvider } = await extractJDSkills(jdText);

  const { matchedSkills, missingSkills, matchPercentage } = await matchSkills(resumeAnalysis.skills, jdSkills);

  const { verdict, reasons, provider: verdictProvider } = await generateVerdict(
    matchedSkills,
    missingSkills,
    matchPercentage,
    resumeAnalysis.totalYearsExperience,
    resumeAnalysis.qualityFlags
  );

  const analysis = await Analysis.create({
    userId: req.userId,
    resumeText,
    resumeSource: resumeSource || 'paste',
    jdText,
    resumeAnalysis,
    jdSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
    verdict,
    reasons,
    aiProvider: verdictProvider || resumeProvider || jdProvider,
  });

  // Increment user's lifetime analyses count on success
  await User.findByIdAndUpdate(req.userId, { $inc: { analysesUsed: 1 } });

  res.status(201).json(analysis);
});

const getHistory = asyncHandler(async (req, res) => {
  const analyses = await Analysis.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .select('-resumeText -jdText'); // keep list light, full text not needed for a list view

  res.status(200).json(analyses);
});

const getById = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });

  if (!analysis) {
    return res.status(404).json({ message: 'Analysis not found' });
  }

  res.status(200).json(analysis);
});

const parseFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const text = await parseFileService(req.file.buffer, req.file.mimetype);
  res.status(200).json({ text });
});

const getSuggestions = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });

  if (!analysis) {
    return res.status(404).json({ message: 'Analysis not found' });
  }

  // Generate suggestions dynamically from the AI service.
  // Note: We do not persist these suggestions to the Analysis document to keep the schema simple.
  // This is a deliberate trade-off: each call to this endpoint will request suggestions fresh from the AI
  // and will consume another suggestion count from the user's limit.
  const { suggestions } = await generateSuggestions(
    analysis.missingSkills,
    analysis.resumeAnalysis ? analysis.resumeAnalysis.qualityFlags : []
  );

  // Increment user's lifetime suggestions count on success
  await User.findByIdAndUpdate(req.userId, { $inc: { suggestionsUsed: 1 } });

  res.status(200).json(suggestions);
});

module.exports = { analyze, getHistory, getById, parseFile, getSuggestions };