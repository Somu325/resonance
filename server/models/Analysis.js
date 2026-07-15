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
  resumeAnalysis: {
    contact: {
      name: String,
      links: [String],
    },
    summary: String,
    experience: [{
      company: String,
      title: String,
      startDate: String,
      endDate: String,
      bullets: [String],
      skillsUsed: [String],
    }],
    education: [{
      degree: String,
      institution: String,
      startDate: String,
      endDate: String,
      grade: String,
    }],
    skills: [String],
    projects: [{
      name: String,
      description: String,
      skillsUsed: [String],
    }],
    certifications: [String],
    totalYearsExperience: Number,
    qualityFlags: [{
      section: String,
      issue: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
    }],
    additionalSections: [{
      sectionName: String,
      content: [String],
    }],
    extractionConfidence: {
      type: String,
      enum: ['high', 'medium', 'low'],
    },
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