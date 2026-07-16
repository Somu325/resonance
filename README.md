# Resonance

## Project overview
Resonance compares a candidate's resume against a job description using AI, providing both a Skill Gap analysis (matched/missing skills, match %) and a Fit Verdict (Qualified/Almost There/Not Yet with 3 reasons). It is built as one unified app rather than two separate ones, since both features share the same input and AI extraction step.

## Live Demo
*   **Frontend**: [https://resume-resonance.web.app](https://resume-resonance.web.app)
*   **Backend API**: [https://resonance-api-s26dta2zia-el.a.run.app](https://resonance-api-s26dta2zia-el.a.run.app)
*   *Note: The backend is hosted on Cloud Run and is configured to scale to zero when inactive. The first request may experience a cold-start delay of a few seconds.*

## Tech stack
*   **Frontend**: React + Vite, React Router, Tailwind CSS, Context API for state management. Context API was chosen over Redux because the application state is limited to user session authentication and a single analysis submission flow, making the setup overhead and boilerplate of Redux unnecessary.
*   **Backend**: Node.js, Express (MVC architecture with controllers, services, models, routes, and middleware separation).
*   **Database**: MongoDB Atlas via Mongoose.
*   **AI**: OpenAI as the primary provider with automatic fallback to Google Gemini if OpenAI fails or times out.
*   **Authentication**: Email/password authentication, Google OAuth, and GitHub OAuth, using Passport.js. Sessions are managed using JWT tokens stored in httpOnly, Secure cookies to protect against XSS (Cross-Site Scripting) and CSRF vulnerabilities.
*   **File parsing**: Multer, pdf-parse, and mammoth for extracting plain text from PDF and DOCX resume uploads.
*   **Logging**: Winston structured logging (with console and daily rotating file transports).
*   **Emailing**: Nodemailer for transactional verification emails.
*   **DevOps & Hosting**: Docker + Google Cloud Run (asia-south1) for backend hosting, Firebase Hosting for frontend hosting.
*   **CI/CD**: GitHub Actions for automated linting, building, and deployment, using Workload Identity Federation (no static Google Cloud service account keys stored in GitHub).

## Features Beyond the Assignment Brief
To make the application robust and production-ready, several features were implemented beyond the initial project requirements:
*   **Full Authentication System**: Implemented email/password logins alongside GitHub and Google OAuth, featuring automatic account linking by email across all three authentication methods.
*   **Email Verification**: Requires users to verify their email address via a secure link (sent via Nodemailer) before running resume analyses.
*   **Account Settings**: Users can change their email address (which re-triggers a verification sequence) or soft-delete their account (which disables access while preserving usage history to prevent quota reset abuse).
*   **Server-side Usage Tracking**: Enforces limits of 5 free resume analyses and 5 free suggestion-generations per account, tracked securely on the backend database.
*   **Structured Resume Parsing**: Parses resumes beyond flat skill lists into structured blocks including education, professional experience (with date-overlap/gap detection), projects, and certifications. Adapts to non-standard layouts with a self-reported extraction confidence score.
*   **AI-Based Skill Alignment**: Handles synonyms and parent-child concepts (e.g. recognizing that "MERN Stack" satisfies requests for MongoDB, Express, React, and Node.js) rather than relying on brittle literal string matching.
*   **AI-Generated Improvements**: Provides contextual feedback, indicating recommendations for missing skills as well as highlighting resume quality flags (such as vague bullet points, gaps in employment, or missing standard sections).
*   **Automated Production CI/CD**: Seamless Git-driven workflows build the backend Docker container, push to Artifact Registry, deploy to Cloud Run, and upload static assets to Firebase Hosting using passwordless GCP Workload Identity Federation.
*   **Production-grade Diagnostics**: Winston structured logs monitor authentication events, OAuth linking decisions, and automatic AI fallbacks.
*   **Production Security**: Rate limiting is configured on authentication routes, combined with a centralized Express error-handling middleware.

## Setup instructions
### Prerequisites
*   Node.js installed locally.
*   MongoDB Atlas connection string.
*   OpenAI and Google Gemini API keys.
*   GitHub and Google Developer Console accounts (for OAuth configuration).
*   SMTP credentials (for email verification).

### Installation
1. Clone the repository.
2. In the root directory, install dependencies:
    ```bash
    npm install
    ```
3. Install backend dependencies:
    ```bash
    cd server && npm install
    ```
4. Install frontend dependencies:
    ```bash
    cd ../client && npm install
    ```

### Environment variables
Create a `.env` file in the `server` directory with the following variables:
*   `PORT`: Port number on which the backend server runs (e.g. 5000).
*   `MONGO_URI`: MongoDB connection string.
*   `JWT_SECRET`: Secret key used to sign JSON Web Tokens.
*   `NODE_ENV`: Application running environment (`development` or `production`).
*   `CLIENT_URL`: URL origin of the frontend application (e.g. `http://localhost:5173`).
*   `SERVER_URL`: URL origin of the backend server (e.g. `http://localhost:5000`).
*   `OPENAI_API_KEY`: API credential key for accessing OpenAI models.
*   `GEMINI_API_KEY`: API credential key for accessing Gemini models.
*   `GITHUB_CLIENT_ID`: Client ID registered in your GitHub OAuth application.
*   `GITHUB_CLIENT_SECRET`: Client Secret registered in your GitHub OAuth application.
*   `GOOGLE_CLIENT_ID`: Client ID registered in your Google Developer Console OAuth credentials.
*   `GOOGLE_CLIENT_SECRET`: Client Secret registered in your Google Developer Console OAuth credentials.
*   `EMAIL_USER`: Outgoing email address for sending verification emails.
*   `EMAIL_PASS`: App password or SMTP password corresponding to `EMAIL_USER`.

### OAuth App Registration Callback URLs
Ensure your OAuth applications are configured with the correct callback URLs:
*   **Google OAuth Callback**: `http://localhost:5000/api/auth/google/callback` (for local development)
*   **GitHub OAuth Callback**: `http://localhost:5000/api/auth/github/callback` (for local development)

### Running the application
To start both frontend and backend dev servers concurrently from the root directory, run:
```bash
npm run dev
```
*   The frontend will run on `http://localhost:5173`.
*   The backend will run on `http://localhost:5000`.

## Architecture notes
*   **MVC backend layout**: Controllers read incoming requests, call service functions, and send responses. Services house all reusable business logic (including AI models, token helpers, and file parsing). Models define Mongoose schemas only.
*   **Unified analysis schema**: A single Analysis document stores the outputs of both the Skill Gap analysis (matchedSkills, missingSkills, matchPercentage) and the Fit Verdict (verdict, reasons). Since these results are computed from the same resume and JD pair in one flow, storing them in a single collection avoids redundant documents and joins.
*   **Deterministic math**: The AI service is used for extracting skills and generating the alignment verdict. The matched/missing skill intersections and final percentage calculations are executed in plain JavaScript to ensure mathematical consistency and speed.
*   **Automatic LLM fallback**: If the OpenAI request fails or exceeds a 20-second timeout, the service catches the error and retries the prompt using the Google Gemini service. The output is parsed and normalized to the same response schema so that the frontend remains independent of the active LLM provider.

## Assumptions
*   **Input flex**: The resume and job description can be entered as either pasted text or uploaded files (.pdf/.docx). Both sources feed the same state block.
*   **Session auth**: Authentication was not explicitly requested but was added to demonstrate full-stack session security (JWT + httpOnly cookies) restricted to email/password registration. GitHub OAuth and email OTP were deferred as out of scope.
*   **History page**: Past comparisons are persisted in MongoDB per user to enable logging, going beyond stateless AI queries.

## Trade-offs
*   **Testing scope**: No automated unit or integration tests are included due to timeframe constraints. Route and frontend flow verification was performed via manual Curl requests and browser interaction.
*   **Rate limiting**: Rate limiting is IP-based (`express-rate-limit`) rather than user-based, which is appropriate for the current deployment scale but would be replaced with Redis-based token buckets in a production environment.
*   **Gemini versioning**: Pinned to a specific model version (`gemini-1.5-flash-001` or similar confirmed tag) rather than a general alias, to avoid silent API failures from deprecated model aliases.
*   **MongoDB Atlas Network Access**: MongoDB Atlas network access is set to allow-from-anywhere (0.0.0.0/0) to accommodate Cloud Run's lack of static outbound IPs. In a fully hardened production deployment, we would configure a Cloud NAT with static IPs or use VPC peering.
*   **Stateless Suggestions**: Resume improvement suggestions are generated dynamically on-demand and are not cached or persisted in the database. Consequently, generating suggestions for the same analysis multiple times counts against the 5-suggestion limit.
*   **OAuth Registration Separation**: Unlike Google OAuth (which allows entering multiple redirect URIs in a single client ID), GitHub only supports one redirect URI per OAuth App. As a result, separate GitHub OAuth Apps must be registered and managed for development and production environments.

## Folder structure
```
├── client/
│   ├── public/              # Static public assets
│   └── src/
│       ├── components/      # Common components (Card, Spinner, SkillChip, EmptyState)
│       ├── context/         # AuthContext and ToastContext providers
│       ├── pages/           # Page modules (Dashboard, Results, History, Login, Signup, NotFound)
│       ├── services/        # Frontend API client (axios configuration)
│       └── App.jsx          # Router paths and root loading configurations
└── server/
    ├── config/              # Database connection setups
    ├── controllers/         # Thin request entry coordinators
    ├── middleware/          # Authentication checks, validation schemas, file uploaders
    ├── models/              # Schema definitions (User and Analysis)
    ├── routes/              # Routing tables for auth and analysis endpoints
    ├── services/            # Core business code (AI integrations, file parsers)
    ├── utils/               # Express error controllers and catch-blocks
    └── server.js            # App listener and bootstrap logic
```
