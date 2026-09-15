You are a senior full-stack engineer, AI engineer, QA engineer, and product designer.

Build a complete, functional web application called:

API Reliability Assistant

This application is being built for a Full Stack Intern technical assessment.

IMPORTANT:
This is NOT a UI prototype.
This is NOT a static dashboard.
This must be a working application where:

API INPUT → VALIDATION → AI GENERATION → STRUCTURED TEST PLAN → COPY/EXPORT

works end-to-end.

Do not create fake test results.
Do not hardcode the generated output.
Do not leave important buttons or interactions as placeholders.

==================================================
1. CORE PRODUCT
==================================================

The application helps developers and QA engineers analyze an API definition and generate a practical API reliability test plan using AI.

The user provides:

- API endpoint
- HTTP method
- Authentication type
- Request body
- Expected behaviour

The application sends this information to the available AI model together with the improved system prompt defined below.

The AI-generated result must be rendered dynamically in the UI.

==================================================
2. INPUT
==================================================

Create a clean API configuration panel.

Fields:

A. API Endpoint
- Required
- Accept paths such as:
  /api/users
  /api/orders/{id}
- Also accept full URLs

B. HTTP Method
Dropdown:
GET
POST
PUT
PATCH
DELETE

C. Authentication
Dropdown:
None
Bearer Token
API Key
Basic Auth

Never ask the user to enter or persist real secrets.
If credentials are needed for demonstration, use placeholders such as:
<BEARER_TOKEN>
<API_KEY>

D. Request Body
- JSON editor/textarea
- Monospace font
- Format JSON button
- Clear button
- Validate JSON automatically

GET and DELETE should allow an empty request body.

E. Expected Behaviour
Required textarea.

Example:
"Creates a new user when valid information is provided. Email addresses must be unique."

==================================================
3. VALIDATION
==================================================

Before AI generation:

- Endpoint must not be empty
- HTTP method must be selected
- Expected behaviour must not be empty
- If request body exists, it must contain valid JSON

If validation fails:

- Do not call the AI
- Highlight the relevant field
- Display a clear human-readable error

Examples:

"Please enter an API endpoint."

"Please describe the expected behaviour."

"Request body contains invalid JSON."

==================================================
4. REAL AI GENERATION
==================================================

The Generate Test Plan button must trigger the real AI generation workflow available in the platform.

Do not simulate AI generation.

The AI request must include:

1. The system prompt below
2. Endpoint
3. HTTP method
4. Authentication type
5. Request body
6. Expected behaviour

If the platform requires a server-side function/API route for AI access, use it.

Never expose an API key or secret in client-side code.

==================================================
5. SYSTEM PROMPT
==================================================

Use this as the application's AI system instruction:

"You are an expert API QA Engineer and API Security Tester.

Analyze the API definition provided by the user and produce a practical, risk-focused API reliability test plan.

Base the analysis on the endpoint, HTTP method, request body, authentication requirements and expected behaviour.

Do not invent undocumented API requirements as facts.

When information is missing, clearly label assumptions.

Generate these sections:

1. API SUMMARY

Include:
- Endpoint
- HTTP method
- Purpose
- Important assumptions
- Potential reliability risks

2. POSITIVE TEST CASES

Test:
- Valid requests
- Valid required fields
- Valid optional fields
- Valid authentication
- Expected successful behaviour

Use IDs:
POS-01, POS-02, POS-03...

3. NEGATIVE TEST CASES

Test relevant failures including:
- Missing required fields
- Invalid data types
- Invalid values
- Malformed JSON
- Invalid identifiers
- Duplicate resources
- Unsupported input
- Invalid authentication

Use IDs:
NEG-01, NEG-02...

4. EDGE CASES

Consider only relevant edge cases:
- Minimum values
- Maximum values
- Just below/above boundaries
- Missing values
- null
- empty strings
- whitespace-only values
- Unicode
- special characters
- large payloads
- duplicate requests
- repeated requests
- concurrency where relevant

Use IDs:
EDGE-01, EDGE-02...

5. VALIDATION CHECKS

Check relevant:
- Required fields
- Data types
- Formats
- Length limits
- Numeric ranges
- Enum values
- Nullability
- Cross-field dependencies
- Business rules

Use IDs:
VAL-01, VAL-02...

6. AUTHENTICATION & AUTHORIZATION

Clearly distinguish authentication from authorization.

Consider:
- Missing credentials
- Invalid credentials
- Expired credentials
- Insufficient permissions
- Incorrect roles
- Accessing another user's resource
- IDOR/BOLA
- Authorization bypass

Use IDs:
AUTH-01, AUTH-02...

7. SECURITY TESTS

Generate only security tests relevant to the API.

Consider:
- SQL/NoSQL injection
- XSS where applicable
- Parameter tampering
- Mass assignment
- Sensitive information exposure
- Authorization bypass
- Rate limiting
- Oversized payloads
- Improper input validation

Use IDs:
SEC-01, SEC-02...

8. EXPECTED HTTP STATUS CODES

For relevant scenarios provide:

- Scenario
- HTTP status code
- Reason

Only include status codes appropriate for the API.

9. SAMPLE REQUESTS

Generate realistic examples where applicable:

- Valid request
- Invalid request
- Boundary request
- Security test request

Include:
- JSON
- curl

FOR EVERY TEST CASE INCLUDE:

- Test ID
- Scenario
- Priority
- Input
- Expected HTTP Status
- Expected Result

Priority must be one of:

Critical
High
Medium
Low

Important rules:

- Do not invent undocumented requirements.
- Clearly identify assumptions.
- Distinguish missing, null, empty and whitespace values.
- Avoid duplicate tests.
- Avoid irrelevant security tests.
- Focus on executable and realistic QA scenarios.
- Prioritize security, authorization, data corruption and critical business failures.
- Prefer useful coverage over generating a huge number of tests.

Return structured data that the application can reliably render.

==================================================
6. STRUCTURED AI OUTPUT
==================================================

Prefer structured JSON output from the AI.

Use this logical schema:

{
  "summary": {},
  "positive": [],
  "negative": [],
  "edge": [],
  "validation": [],
  "authentication": [],
  "security": [],
  "statusCodes": [],
  "sampleRequests": []
}

Each test case should contain:

{
  "id": "...",
  "scenario": "...",
  "priority": "...",
  "input": "...",
  "expectedStatus": "...",
  "expectedResult": "..."
}

If structured output is not supported by the platform, safely parse the AI response and render the sections without crashing.

==================================================
7. RESULTS
==================================================

After generation show:

API Reliability Report

Display:

- Endpoint
- HTTP Method
- Total Test Cases
- Positive
- Negative
- Edge
- Validation
- Authentication
- Security
- Critical/High priority

These values MUST be calculated from the generated result.

Never hardcode statistics.

==================================================
8. TEST CASE UI
==================================================

Create collapsible sections:

✓ Positive Test Cases
✕ Negative Test Cases
⚠ Edge Cases
✓ Validation Checks
🔐 Authentication & Authorization
🛡 Security Checks
HTTP Status Codes
Sample Requests

Every test case displays:

ID
Priority
Scenario
Input
Expected HTTP Status
Expected Result

Status badges:

2xx = success
4xx = client error
5xx = server error

==================================================
9. SAMPLE REQUESTS
==================================================

Show generated:

- Valid JSON
- Invalid JSON/request
- Boundary request where relevant
- Security request where relevant
- curl commands

Every code block must have a working Copy button.

==================================================
10. COPY
==================================================

Implement real clipboard functionality.

Provide:

- Copy test case
- Copy section
- Copy Full Test Plan
- Copy as Markdown
- Copy curl commands

After clicking Copy:

- Copy actual generated content
- Show "Copied"
- Change icon temporarily
- Restore after approximately 2 seconds

==================================================
11. EXPORT
==================================================

Implement:

Download JSON

The downloaded file must contain the CURRENT generated result.

Do not use hardcoded JSON.

Also implement:

Copy as Markdown

The Markdown must be generated from the CURRENT result.

==================================================
12. EXAMPLE APIs
==================================================

Before the first generation, show example API cards.

Example 1:

POST /api/users

Request body:

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25
}

Expected behaviour:

"Creates a new user. Email must be unique. Age must be between 18 and 100."

Example 2:

GET /api/orders/{id}

Expected behaviour:

"Returns the order belonging to the authenticated user. Users must not access orders belonging to another user."

Example 3:

PUT /api/products/{id}

Expected behaviour:

"Updates product information. Price must be positive and stock cannot be negative."

Clicking an example MUST populate the input fields.

==================================================
13. LOADING
==================================================

While generating:

Disable Generate Test Plan.

Show skeleton/loading UI.

Cycle through:

"Analyzing API definition..."

"Identifying failure scenarios..."

"Checking validation rules..."

"Analyzing authentication and security..."

"Building test plan..."

Do not show only a spinner.

==================================================
14. ERROR HANDLING
==================================================

Handle:

- Missing endpoint
- Missing expected behaviour
- Invalid JSON
- AI generation failure
- Invalid AI response
- Network/API failure

Show human-readable errors.

Example:

"We couldn't generate the test plan. Please try again."

Include a working Retry action.

Never display API secrets.

==================================================
15. HISTORY
==================================================

Store the last 5 successful test plans locally.

For each history item store:

- Endpoint
- HTTP method
- Generated timestamp
- Generated result

Do NOT store authentication secrets.

Clicking a history item must restore the previous result.

Implement:

- Delete history item
- Clear history

History must survive page refresh.

==================================================
16. PROMPT PREVIEW
==================================================

Add a collapsible "Prompt Preview".

Show the actual system prompt used by the application.

Do not show secrets.

This allows the interviewer to inspect the prompt engineering.

==================================================
17. DESIGN
==================================================

Create a polished professional developer tool.

Use:

- Modern responsive layout
- Clean typography
- Strong visual hierarchy
- Monospace styling for JSON/curl
- Subtle borders
- Clear status badges
- Smooth but minimal animations
- Accessible focus states

Use a professional developer-tool aesthetic inspired by Linear, Vercel and Postman.

Avoid:

- Fake dashboard statistics
- Excessive gradients
- Excessive glassmorphism
- Giant marketing sections
- Unnecessary widgets
- Visual clutter

Functionality is more important than visual effects.

==================================================
18. RESPONSIVE DESIGN
==================================================

Desktop:

Two-column workspace:

LEFT:
API Configuration

RIGHT:
Generated Test Plan

Mobile/tablet:

Stack input above results.

Ensure:

- Tables remain usable
- Code blocks scroll horizontally when necessary
- Buttons remain accessible
- No overlapping content
- No broken layouts

==================================================
19. ACCESSIBILITY
==================================================

Use:

- Proper labels
- Keyboard-accessible controls
- Visible focus states
- Accessible buttons
- Good contrast
- Do not rely only on color to communicate status

==================================================
20. CRITICAL IMPLEMENTATION RULE
==================================================

Build functionality first.

Priority order:

1. Input form
2. Validation
3. Real AI generation
4. Structured result parsing
5. Dynamic result rendering
6. Error handling
7. Copy
8. JSON export
9. Example APIs
10. History
11. Prompt Preview
12. Responsive UI
13. Visual polish

Do not stop after creating the interface.

==================================================
21. SELF-TEST BEFORE COMPLETION
==================================================

Before considering the application complete, verify these workflows:

TEST 1:
Select POST /api/users.
Generate.
A dynamically generated test plan appears.

TEST 2:
Select GET /api/orders/{id}.
Generate.
The output changes and contains GET/order-specific tests.

TEST 3:
Change to PUT /api/products/{id}.
Generate.
The output reflects product update scenarios.

TEST 4:
Enter invalid JSON.
Generation is blocked and an inline validation error appears.

TEST 5:
Click Copy.
The generated content is copied to the clipboard.

TEST 6:
Click Download JSON.
A valid JSON file containing the current test plan is downloaded.

TEST 7:
Generate a test plan.
Refresh the page.
The history item remains available.

TEST 8:
Click the history item.
The previous test plan is restored.

TEST 9:
Click an example API.
All relevant form fields populate automatically.

TEST 10:
Open Prompt Preview.
The actual AI prompt is displayed.

If any of these workflows do not work, fix the implementation before finishing.

==================================================
FINAL PRODUCT GOAL
==================================================

The finished application should feel like:

"An AI-powered API QA engineer that converts an API definition into an executable, risk-focused reliability test plan."

It must demonstrate:

- Full-stack implementation
- AI integration
- Prompt engineering
- API testing knowledge
- Security awareness
- Dynamic data handling
- Validation
- Error handling
- State management
- Export functionality
- Professional UX

Do not build only a visually impressive interface.

Build the working product.