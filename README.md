# Resonance

## Project overview
Resonance compares a candidate's resume against a job description using AI, providing both a Skill Gap analysis (matched/missing skills, match %) and a Fit Verdict (Qualified/Almost There/Not Yet with 3 reasons). It is built as one unified app rather than two separate ones, since both features share the same input and AI extraction step.

## Tech stack
*   **Frontend**: React + Vite, React Router, Tailwind CSS, Context API for state management. Context API was chosen over Redux because the application state is limited to user session authentication and a single analysis submission flow, making the setup overhead and boilerplate of Redux unnecessary.
*   **Backend**: Node.js, Express (MVC architecture with controllers, services, models, routes, and middleware separation).
*   **Database**: MongoDB Atlas via Mongoose.
*   **AI**: OpenAI as the primary provider with automatic fallback to Google Gemini if OpenAI fails or times out.
*   **Authentication**: Email and password authentication with JWT sessions stored in httpOnly cookies (not localStorage) to mitigate cross-site scripting (XSS) risks.
*   **File parsing**: Multer, pdf-parse, and mammoth for extracting plain text from PDF and DOCX resume uploads.

## Setup instructions
### Prerequisites
*   Node.js installed locally.
*   MongoDB Atlas connection string.
*   OpenAI API key.
*   Gemini API key.

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
*   `NODE_ENV`: Application running environment (development or production).
*   `CLIENT_URL`: URL origin of the frontend application (e.g. http://localhost:5173).
*   `OPENAI_API_KEY`: API credential key for accessing OpenAI models.
*   `GEMINI_API_KEY`: API credential key for accessing Gemini models.

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
*   Deployment: not deployed, run locally per instructions above

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
