# API Reliability Assistant

A full-stack web application that helps developers and QA engineers analyze an API definition and generate a practical, risk-focused API reliability test plan using AI.

## Features

- **API Configuration Panel**: Input endpoint, HTTP method, authentication, request body, and expected behavior
- **Real-time Validation**: Validates inputs before AI generation
- **AI-Powered Test Generation**: Generates comprehensive test plans using OpenAI GPT-4o-mini
- **Structured Output**: Organized test cases in 7 categories (Positive, Negative, Edge, Validation, Auth, Security, Status Codes)
- **Sample Requests**: Realistic JSON and cURL examples
- **Copy/Export**: Copy individual test cases, sections, full plan, Markdown, or cURL commands; download as JSON
- **History**: Stores last 5 test plans locally (survives refresh)
- **Example APIs**: Pre-built examples to try instantly
- **Prompt Preview**: Inspect the actual system prompt used
- **Responsive Design**: Two-column desktop layout, stacked mobile layout
- **Accessibility**: Proper labels, keyboard navigation, focus states, contrast

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: OpenAI API (gpt-4o-mini)
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- OpenAI API key (optional - includes mock fallback for testing)

### Installation

```bash
cd api-reliability-assistant
npm install
```

### Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Add your OpenAI API key to `.env.local`:
```env
OPENAI_API_KEY=your_actual_openai_api_key_here
```

**Note**: Without an API key, the app uses a comprehensive mock generator that produces realistic test plans based on your input.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Configure API**: Fill in the endpoint, method, authentication type, request body (JSON), and expected behavior
2. **Validate**: Form validates automatically - shows inline errors for missing/invalid fields
3. **Generate**: Click "Generate Test Plan" to create the test plan
4. **Review**: Browse collapsible sections with test cases, status codes, and sample requests
5. **Copy/Export**: Use copy buttons for individual items or export full plan as JSON/Markdown/cURL
6. **History**: Previous generations are saved automatically - click to restore

## Test Plan Structure

The AI generates these sections:

| Section | Description |
|---------|-------------|
| **API Summary** | Endpoint, method, purpose, assumptions, risks |
| **Positive Tests** | Valid requests, valid fields, valid auth, expected success |
| **Negative Tests** | Missing fields, invalid types, invalid values, malformed JSON, invalid auth |
| **Edge Cases** | Boundaries, null, empty, unicode, large payloads, duplicates, concurrency |
| **Validation Checks** | Required fields, types, formats, ranges, enums, cross-field rules |
| **Auth & AuthZ** | Missing/invalid/expired creds, permissions, roles, IDOR/BOLA |
| **Security Tests** | SQL injection, XSS, parameter tampering, mass assignment, rate limiting |
| **Status Codes** | Scenario → HTTP status → reason mapping |
| **Sample Requests** | Valid, invalid, boundary, security requests in JSON + cURL |

Each test case includes: ID, Scenario, Priority (Critical/High/Medium/Low), Input, Expected Status, Expected Result.

## Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts    # AI generation API endpoint
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   ├── ApiConfigForm.tsx        # Input form with validation
│   ├── CollapsibleSection.tsx   # Collapsible test case tables
│   ├── ErrorDisplay.tsx         # Error with retry
│   ├── ExampleCards.tsx         # Example API cards
│   ├── HistoryPanel.tsx         # LocalStorage history
│   ├── LoadingSkeleton.tsx      # Animated loading with messages
│   ├── PromptPreview.tsx        # System prompt viewer
│   ├── SampleRequestsSection.tsx # Sample requests with copy
│   ├── StatusCodesSection.tsx   # Status codes table
│   ├── TestCaseRow.tsx          # Individual test case row
│   └── TestPlanResult.tsx       # Results renderer
├── lib/
│   ├── prompt.ts                # System prompt & constants
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Helper functions
```

## Assessment Checklist

All 10 self-tests from the specification pass:

1. ✅ POST /api/users → generates test plan
2. ✅ GET /api/orders/{id} → generates GET-specific tests
3. ✅ PUT /api/products/{id} → generates product update tests
4. ✅ Invalid JSON → blocks generation, shows inline error
5. ✅ Copy buttons → copy to clipboard with feedback
6. ✅ Download JSON → valid JSON file with current plan
7. ✅ History persists → survives page refresh
8. ✅ History click → restores previous plan
9. ✅ Example click → populates all form fields
10. ✅ Prompt Preview → shows actual system prompt

## License

MIT