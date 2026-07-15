const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Parses file buffer (PDF or DOCX) to extract plain text.
 * @param {Buffer} buffer - File buffer.
 * @param {string} mimetype - The file MIME type.
 * @returns {Promise<string>} Plain text content.
 */
const parseFile = async (buffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      const err = new Error('Unsupported file type');
      err.statusCode = 400;
      throw err;
    }
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    const err = new Error('Could not read this file, try pasting the text instead');
    err.statusCode = 422;
    throw err;
  }
};

module.exports = { parseFile };
