const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../config/logger");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const callWithTimeout = (promise, ms = 20000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Timeout"));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

const analyzeResume = async (resumeText) => {
  const prompt = `
You are an expert resume parser. Analyze the resume text below and extract it into a structured JSON object matching this exact schema:

{
  "contact": { "name": "string or null", "links": ["string"] },
  "summary": "string or null",
  "experience": [{
    "company": "string",
    "title": "string",
    "startDate": "string",
    "endDate": "string",
    "bullets": ["string"],
    "skillsUsed": ["string"]
  }],
  "education": [{
    "degree": "string",
    "institution": "string",
    "startDate": "string",
    "endDate": "string",
    "grade": "string or null"
  }],
  "skills": ["string"],
  "projects": [{
    "name": "string",
    "description": "string",
    "skillsUsed": ["string"]
  }],
  "certifications": ["string"],
  "totalYearsExperience": number,
  "qualityFlags": [{ 
    "section": "string",
    "issue": "string",
    "severity": "low" | "medium" | "high"
  }],
  "additionalSections": [{
    "sectionName": "string",
    "content": ["string"]
  }],
  "extractionConfidence": "high" | "medium" | "low"
}

Key Instructions:
1. Resumes vary widely in structure, section names, and completeness. Do not force content into a category it doesn't belong to. If a resume has no clear "summary" section, leave the "summary" field empty/null rather than fabricating one from other content. If experience entries lack clear start/end dates (e.g. freelance, ongoing, or vaguely described), extract whatever is stated as a free-text string (e.g. "Freelance", "Ongoing", "Present") rather than guessing or leaving it silently blank.
2. Recognize section-name synonyms:
   - "Work Experience", "Employment History", "Professional Experience", or a list of companies/roles with no header at all must map to the "experience" array.
   - "Technical Skills", "Core Competencies", "Tech Stack", "Skills & Tools", or a list of tools/technologies must map to the "skills" array.
3. Extract skills mentioned inline within experience bullets (not just from a dedicated skills section) and merge them into the flat "skills" array, fully de-duplicated.
4. Any legitimate resume content that doesn't fit standard categories (e.g. "Publications", "Volunteer Experience", "Languages", "Awards", "Patents", "Interests") must go into the "additionalSections" array rather than being dropped.
5. Self-assess and set the "extractionConfidence" value:
   - 'high': the document structure was clear and the extraction is highly reliable.
   - 'medium': some sections were ambiguous or inferred, or formatting was slightly messy.
   - 'low': the text appears garbled, out of order, or insufficient to confidently parse (e.g., likely a PDF table/column extraction issue).
   Provide an honest signal; do not default to 'high'.

Field-specific instructions:
- contact: Extract candidate name and link URLs.
- experience: Professional work history with bullet points and skills used.
- education: Degrees, schools, start dates, end dates, and grade. Extract GPA/percentage into grade when present on the resume.
- skills: A flat array of all technical/professional skills found or mentioned in the resume.
- projects: Key projects details.
- certifications: Certifications.
- totalYearsExperience: Estimated total years of work experience as a number.
- qualityFlags: Flag any resume quality issues:
   - vague bullets with no measurable impact/metrics.
   - unexplained employment gaps or overlaps: Before flagging any employment gap or overlap, you must first list out each role's start and end dates in chronological order as an internal reasoning step, then only flag a genuine overlap if two date ranges actually intersect (i.e. one role's start date falls before another role's end date, with both being employment, not just close together), and only flag a genuine gap if there is unaccounted time of 6+ months between one role's end date and the next role's start date. Consecutive or back-to-back roles (one ending the same month/year another begins, e.g. one ending Feb 2025, next starting Mar 2025) are NOT overlaps and must NOT be flagged.
   - missing sections entirely (e.g. no professional summary).
   - inconsistent or missing dates.
   Each flag must specify the "section" (e.g., "experience", "summary"), a specific one-sentence "issue", and "severity" ('low' | 'medium' | 'high').

Return ONLY valid JSON. Do not wrap in markdown or add commentary.

Resume:
${resumeText}
`;

  let responseText;
  let provider;

  try {
    const response = await callWithTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
      20000
    );
    responseText = response.choices[0].message.content;
    provider = "openai";
  } catch (err) {
    logger.warn('OpenAI resume analysis failed, falling back to Gemini', {
      event: 'ai_fallback_triggered',
      function: 'analyzeResume',
      primaryProvider: 'openai',
      reason: err.message
    });
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await callWithTimeout(model.generateContent(prompt), 20000);
      responseText = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      provider = "gemini";
    } catch (geminiErr) {
      logger.error('Both AI providers failed for analyzeResume', {
        event: 'ai_both_providers_failed',
        function: 'analyzeResume',
        openaiError: err.message,
        geminiError: geminiErr.message
      });
      const apiError = new Error("AI_UNAVAILABLE");
      apiError.statusCode = 502;
      throw apiError;
    }
  }

  try {
    const parsed = JSON.parse(responseText);
    return { resumeAnalysis: parsed, provider };
  } catch (parseErr) {
    const error = new Error("Analysis failed, please try again");
    error.statusCode = 502;
    throw error;
  }
};

const extractJDSkills = async (jdText) => {
  const prompt = `
Extract technical skills from the job description below.
Return ONLY valid JSON in this exact shape, nothing else:
{"jdSkills": ["skill1", "skill2"]}

Job Description:
${jdText}
`;

  let responseText;
  let provider;

  try {
    const response = await callWithTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
      20000
    );
    responseText = response.choices[0].message.content;
    provider = "openai";
  } catch (err) {
    logger.warn('OpenAI JD extraction failed, falling back to Gemini', {
      event: 'ai_fallback_triggered',
      function: 'extractJDSkills',
      primaryProvider: 'openai',
      reason: err.message
    });
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await callWithTimeout(model.generateContent(prompt), 20000);
      responseText = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      provider = "gemini";
    } catch (geminiErr) {
      logger.error('Both AI providers failed for extractJDSkills', {
        event: 'ai_both_providers_failed',
        function: 'extractJDSkills',
        openaiError: err.message,
        geminiError: geminiErr.message
      });
      const apiError = new Error("AI_UNAVAILABLE");
      apiError.statusCode = 502;
      throw apiError;
    }
  }

  try {
    const parsed = JSON.parse(responseText);
    return { ...parsed, provider };
  } catch (parseErr) {
    const error = new Error("Analysis failed, please try again");
    error.statusCode = 502;
    throw error;
  }
};

const matchSkills = async (resumeSkills, jdSkills) => {
  const prompt = `
Given two skill lists:
1. Resume Skills: ${JSON.stringify(resumeSkills || [])}
2. Job Description (JD) Required Skills: ${JSON.stringify(jdSkills || [])}

Identify which JD skills are genuinely satisfied by the resume.
- Recognize equivalent or synonymous terms (e.g. "React.js" = "React", "JavaScript (ES6+)" = "JavaScript", "AWS" = "Amazon Web Services", "Postgres" = "PostgreSQL").
- Version numbers and suffixes (like .js or .io) should not cause a mismatch.
- Do NOT count genuinely different technologies as matches even if related (e.g. "Vue" should not match "React", "MySQL" should not match "MongoDB").
- If a JD skill is an umbrella or bundle term referring to a combination of other individual technologies (e.g. "MERN stack" = MongoDB + Express.js + React.js + Node.js, "LAMP stack" = Linux + Apache + MySQL + PHP, "MEAN stack" = MongoDB + Express.js + Angular + Node.js), treat that umbrella term as MATCHED if the resume demonstrates all (or substantially all) of its component technologies individually — even if the resume never uses the literal bundle phrase. Do not require the exact phrase "MERN stack" to appear verbatim on the resume if the resume clearly has MongoDB, Express, React, and Node experience. This applies only to well-known, unambiguous stack/bundle acronyms — do not invent loose bundling for skills that aren't genuinely standard umbrella terms.

Return ONLY valid JSON in this exact shape:
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3"],
  "matchPercentage": 67
}

Rules:
1. "matchedSkills" and "missingSkills" must use the JD's original skill naming (not the resume's).
2. "matchPercentage" is matchedSkills.length / jdSkills.length as a rounded integer from 0 to 100.

Return ONLY valid JSON. Do not wrap in markdown or add commentary.
`;

  let responseText;
  let provider;

  try {
    const response = await callWithTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
      20000
    );
    responseText = response.choices[0].message.content;
    provider = "openai";
  } catch (err) {
    logger.warn('OpenAI skill matching failed, falling back to Gemini', {
      event: 'ai_fallback_triggered',
      function: 'matchSkills',
      primaryProvider: 'openai',
      reason: err.message
    });
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await callWithTimeout(model.generateContent(prompt), 20000);
      responseText = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      provider = "gemini";
    } catch (geminiErr) {
      logger.error('Both AI providers failed for matchSkills', {
        event: 'ai_both_providers_failed',
        function: 'matchSkills',
        openaiError: err.message,
        geminiError: geminiErr.message
      });
      const apiError = new Error("AI_UNAVAILABLE");
      apiError.statusCode = 502;
      throw apiError;
    }
  }

  try {
    const parsed = JSON.parse(responseText);
    const matched = parsed.matchedSkills || [];
    const missing = parsed.missingSkills || [];
    const jdLength = jdSkills && jdSkills.length;
    const matchPercentage = jdLength === 0 ? 0 : Math.round((matched.length / jdLength) * 100);

    return {
      matchedSkills: matched,
      missingSkills: missing,
      matchPercentage,
      provider,
    };
  } catch (parseErr) {
    const error = new Error("Analysis failed, please try again");
    error.statusCode = 502;
    throw error;
  }
};

const generateVerdict = async (
  matchedSkills,
  missingSkills,
  matchPercentage,
  totalYearsExperience,
  qualityFlags
) => {
  const flagsText = (qualityFlags && qualityFlags.length > 0)
    ? qualityFlags.map(f => `- [${f.severity.toUpperCase()}] ${f.section}: ${f.issue}`).join("\n")
    : "none";

  const prompt = `
Analyze the candidate's match for a job description based on the following details:

1. Skill Match Percentage: ${matchPercentage}%
2. Matched Skills: ${matchedSkills.join(", ") || "none"}
3. Missing Skills: ${missingSkills.join(", ") || "none"}
4. Total Years of Experience: ${totalYearsExperience !== undefined ? totalYearsExperience : "not provided"}
5. Resume Quality Flags:
${flagsText}

Classify this candidate as exactly one of: "Qualified", "Almost There", "Not Yet".

In determining the verdict and the supporting reasons, evaluate the details in this priority order:
1. Skill match percentage and which specific skills are missing.
2. Total years of work experience as a signal of seniority match for the role.
3. Any HIGH severity quality flags as a mitigating factor (e.g. strong skill match but resume has unexplained gaps or critical issues). Do NOT let low/medium severity flags dominate the verdict, they are minor.

Return ONLY valid JSON in this exact shape, containing exactly 3 short, concise reasons supporting the verdict:
{"verdict": "Almost There", "reasons": ["reason1", "reason2", "reason3"]}
`;

  let responseText;
  let provider;

  try {
    const response = await callWithTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
      20000
    );
    responseText = response.choices[0].message.content;
    provider = "openai";
  } catch (err) {
    logger.warn('OpenAI verdict failed, falling back to Gemini', {
      event: 'ai_fallback_triggered',
      function: 'generateVerdict',
      primaryProvider: 'openai',
      reason: err.message
    });
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await callWithTimeout(model.generateContent(prompt), 20000);
      responseText = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      provider = "gemini";
    } catch (geminiErr) {
      logger.error('Both AI providers failed for generateVerdict', {
        event: 'ai_both_providers_failed',
        function: 'generateVerdict',
        openaiError: err.message,
        geminiError: geminiErr.message
      });
      const apiError = new Error("AI_UNAVAILABLE");
      apiError.statusCode = 502;
      throw apiError;
    }
  }

  try {
    const parsed = JSON.parse(responseText);
    return { ...parsed, provider };
  } catch (parseErr) {
    const error = new Error("Analysis failed, please try again");
    error.statusCode = 502;
    throw error;
  }
};

const generateSuggestions = async (missingSkills, qualityFlags) => {
  const relevantFlags = (qualityFlags || []).filter(f => {
    const sev = (f.severity || '').toLowerCase();
    return sev === 'high' || sev === 'medium';
  });

  const prompt = `
You are a professional career coach and resume expert.
Given a list of missing skills (gaps between a candidate's resume and a Job Description) and a list of resume quality flags (issues detected in the resume), generate concrete, actionable suggestions for improving the resume.

Input details:
1. Missing Skills:
${(missingSkills || []).map(skill => `- ${skill}`).join('\n') || 'None'}

2. Resume Quality Flags (High/Medium Severity):
${relevantFlags.map(f => `- [${f.severity.toUpperCase()}] Section: ${f.section}, Issue: ${f.issue}`).join('\n') || 'None'}

Instructions:
- Provide exactly one concrete, actionable suggestion for each missing skill listed under "Missing Skills". Explain how the candidate can demonstrate this skill on their resume or gain it.
- Provide exactly one concrete, actionable suggestion for each quality flag listed under "Resume Quality Flags". Explain how to fix that specific issue.
- The output must be dynamically sized to however many gaps actually exist.
- Return ONLY a valid JSON object matching this exact schema:
{
  "suggestions": [
    {
      "type": "missing_skill" | "quality_flag",
      "target": "string (the name of the missing skill or the issue description of the quality flag)",
      "suggestion": "string (the concrete, actionable advice)"
    }
  ]
}

Return ONLY valid JSON. Do not wrap in markdown or add commentary.
`;

  let responseText;
  let provider;

  try {
    const response = await callWithTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
      20000
    );
    responseText = response.choices[0].message.content;
    provider = "openai";
  } catch (err) {
    logger.warn('OpenAI generateSuggestions failed, falling back to Gemini', {
      event: 'ai_fallback_triggered',
      function: 'generateSuggestions',
      primaryProvider: 'openai',
      reason: err.message
    });
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await callWithTimeout(model.generateContent(prompt), 20000);
      responseText = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      provider = "gemini";
    } catch (geminiErr) {
      logger.error('Both AI providers failed for generateSuggestions', {
        event: 'ai_both_providers_failed',
        function: 'generateSuggestions',
        openaiError: err.message,
        geminiError: geminiErr.message
      });
      const apiError = new Error("AI_UNAVAILABLE");
      apiError.statusCode = 502;
      throw apiError;
    }
  }

  try {
    const parsed = JSON.parse(responseText);
    return { suggestions: parsed.suggestions || [], provider };
  } catch (parseErr) {
    const error = new Error("Analysis failed, please try again");
    error.statusCode = 502;
    throw error;
  }
};

module.exports = { analyzeResume, extractJDSkills, matchSkills, generateVerdict, generateSuggestions };
