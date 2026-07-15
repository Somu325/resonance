const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeText: {
    type: String,
    required: true,
  },
  resumeSource: {
    type: String,
    enum: ['paste', 'pdf', 'docx'],
    required: true,
  },
  jdText: {
    type: String,
    required: true,
  },
  resumeSkills: {
    type: [String],
    default: [],
  },
  jdSkills: {
    type: [String],
    default: [],
  },
  matchedSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  matchPercentage: {
    type: Number,
    required: true,
  },
  verdict: {
    type: String,
    enum: ['Qualified', 'Almost There', 'Not Yet'],
    required: true,
  },
  reasons: {
    type: [String],
    default: [],
  },
  aiProvider: {
    type: String,
    enum: ['openai', 'gemini'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);