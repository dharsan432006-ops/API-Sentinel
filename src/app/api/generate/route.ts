import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import type { TestPlan, TestCase, StatusCode, SampleRequest } from "@/lib/types";

const VALID_PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;

function toSafeString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  try {
    return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
  } catch {
    return fallback;
  }
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

function normalizeTestCase(tc: unknown, fallbackId: string): TestCase | null {
  if (!tc || typeof tc !== "object") return null;
  const t = tc as Record<string, unknown>;
  const priority = VALID_PRIORITIES.includes(t.priority as (typeof VALID_PRIORITIES)[number])
    ? (t.priority as TestCase["priority"])
    : "Medium";
  const scenario = toSafeString(t.scenario).trim();
  if (!scenario) return null;
  return {
    id: toSafeString(t.id, fallbackId).trim() || fallbackId,
    scenario,
    priority,
    input: toSafeString(t.input, "(no input provided)"),
    expectedStatus: toSafeString(t.expectedStatus, "200").trim() || "200",
    expectedResult: toSafeString(t.expectedResult, "See scenario").trim() || "See scenario",
  };
}

function normalizeList(list: unknown, prefix: string): TestCase[] {
  if (!Array.isArray(list)) return [];
  const out: TestCase[] = [];
  list.forEach((item, i) => {
    const id = `${prefix}-${String(i + 1).padStart(3, "0")}`;
    const tc = normalizeTestCase(item, id);
    if (tc) out.push(tc);
  });
  return out;
}

function normalizePlan(raw: unknown, endpoint: string, method: string): TestPlan {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const summary = (r.summary && typeof r.summary === "object" ? r.summary : {}) as Record<string, unknown>;
  const assumptions = Array.isArray(summary.assumptions)
    ? summary.assumptions.map((a) => toSafeString(a)).filter(Boolean)
    : [];
  const risks = Array.isArray(summary.risks)
    ? summary.risks.map((x) => toSafeString(x)).filter(Boolean)
    : [];
  const statusCodes: StatusCode[] = Array.isArray(r.statusCodes)
    ? (r.statusCodes as Record<string, unknown>[]).map((sc) => ({
        scenario: toSafeString(sc.scenario, "Scenario"),
        statusCode: toSafeString(sc.statusCode, "200"),
        reason: toSafeString(sc.reason, ""),
      }))
    : [];
  const sampleRequests: SampleRequest[] = Array.isArray(r.sampleRequests)
    ? (r.sampleRequests as Record<string, unknown>[]).map((sr) => ({
        label: toSafeString(sr.label, "Sample Request"),
        json: toSafeString(sr.json, "{}"),
        curl: toSafeString(sr.curl, ""),
      }))
    : [];
  return {
    summary: {
      endpoint: toSafeString(summary.endpoint, endpoint),
      method: toSafeString(summary.method, method),
      purpose: toSafeString(summary.purpose, `${method} ${endpoint}`),
      assumptions,
      risks,
    },
    positive: normalizeList(r.positive, "POS"),
    negative: normalizeList(r.negative, "NEG"),
    edge: normalizeList(r.edge, "EDGE"),
    validation: normalizeList(r.validation, "VAL"),
    authentication: normalizeList(r.authentication, "AUTH"),
    security: normalizeList(r.security, "SEC"),
    statusCodes,
    sampleRequests,
  };
}

function authHeaderSnippet(authType: string): string {
  switch (authType) {
    case "Bearer Token":
      return '-H "Authorization: Bearer <YOUR_TOKEN>"';
    case "API Key":
      return '-H "X-API-Key: <YOUR_API_KEY>"';
    case "Basic Auth":
      return '-H "Authorization: Basic <BASE64_CREDENTIALS>"';
    case "OAuth 2.0":
      return '-H "Authorization: Bearer <OAUTH2_ACCESS_TOKEN>"';
    default:
      return "";
  }
}

function authLabel(authType: string): string {
  return authType || "None";
}

// Dynamic offline generator: builds a relevant plan from the actual API
// definition when no LLM key is configured. Never hardcoded output.
function generateMockTestPlan(endpoint: string, method: string, authType: string, requestBody: string, expectedBehaviour: string): TestPlan {
  const hasBody = requestBody.trim() !== "";

  let parsedBody: Record<string, unknown> = {};
  try { parsedBody = JSON.parse(requestBody); } catch { parsedBody = {}; }

  const isPost = method === "POST";
  const fields = Object.keys(parsedBody);
  const requiredFields = fields.slice(0, Math.max(1, Math.floor(fields.length / 2)));
  const optionalFields = fields.slice(Math.max(1, Math.floor(fields.length / 2)));
  const hasIdParam = endpoint.includes("{id}") || endpoint.includes(":id") || endpoint.includes("<id>");
  const auth = authLabel(authType);
  const needsAuth = auth !== "None";
  const authSnippet = authHeaderSnippet(auth);
  const curlAuth = authSnippet ? ` \\\n  ${authSnippet}` : "";
  const numericFields = fields.filter((f) => typeof parsedBody[f] === "number");

  const positiveCases: TestCase[] = [
    {
      id: "POS-001",
      scenario: `Valid ${method} request with all required fields`,
      priority: "Critical",
      input: hasBody ? JSON.stringify(parsedBody, null, 2) : "(empty body)",
      expectedStatus: isPost ? "201" : "200",
      expectedResult: isPost ? "Resource created successfully" : "Resource retrieved/updated successfully",
    },
    {
      id: "POS-002",
      scenario: `Valid ${method} request with optional fields`,
      priority: "High",
      input: hasBody ? JSON.stringify({ ...parsedBody, ...Object.fromEntries(optionalFields.map(f => [f, parsedBody[f]])) }, null, 2) : "(empty body)",
      expectedStatus: isPost ? "201" : "200",
      expectedResult: "Request processed with optional fields included",
    },
  ];

  if (needsAuth) {
    positiveCases.push({
      id: "POS-003",
      scenario: `Valid authentication with ${auth}`,
      priority: "Critical",
      input: `Valid ${auth.toLowerCase()} credentials`,
      expectedStatus: isPost ? "201" : "200",
      expectedResult: "Authenticated request succeeds",
    });
  }

  const negativeCases: TestCase[] = [
    {
      id: "NEG-001",
      scenario: "Missing required fields",
      priority: "Critical",
      input: hasBody ? JSON.stringify(Object.fromEntries(requiredFields.map(f => [f, undefined])), null, 2) : "(empty body)",
      expectedStatus: "400",
      expectedResult: "Validation error: required fields missing",
    },
    {
      id: "NEG-002",
      scenario: "Invalid data types in request body",
      priority: "High",
      input: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, typeof parsedBody[f] === "number" ? "not-a-number" : 123])), null, 2) : "(empty body)",
      expectedStatus: "400",
      expectedResult: "Validation error: type mismatch",
    },
    {
      id: "NEG-003",
      scenario: "Malformed JSON in request body",
      priority: "High",
      input: "{ invalid json }",
      expectedStatus: "400",
      expectedResult: "Parse error: malformed JSON",
    },
  ];

  if (needsAuth) {
    negativeCases.push(
      {
        id: "NEG-004",
        scenario: "Missing authentication credentials",
        priority: "Critical",
        input: "No Authorization header",
        expectedStatus: "401",
        expectedResult: "Authentication required error",
      },
      {
        id: "NEG-005",
        scenario: "Invalid authentication credentials",
        priority: "Critical",
        input: `Invalid ${auth.toLowerCase()}`,
        expectedStatus: "401",
        expectedResult: "Invalid credentials error",
      },
      {
        id: "NEG-006",
        scenario: "Expired authentication credentials",
        priority: "High",
        input: `Expired ${auth.toLowerCase()}`,
        expectedStatus: "401",
        expectedResult: "Token expired error",
      }
    );
  }

  if (hasIdParam) {
    negativeCases.push(
      {
        id: `NEG-${String(negativeCases.length + 1).padStart(3, "0")}`,
        scenario: "Invalid resource identifier",
        priority: "High",
        input: "Non-existent or malformed ID",
        expectedStatus: "404",
        expectedResult: "Resource not found",
      },
      {
        id: `NEG-${String(negativeCases.length + 2).padStart(3, "0")}`,
        scenario: "Accessing another user's resource (IDOR/BOLA)",
        priority: "Critical",
        input: "Valid auth but different user's resource ID",
        expectedStatus: "403",
        expectedResult: "Forbidden: insufficient permissions",
      }
    );
  }

  if (isPost) {
    negativeCases.push({
      id: `NEG-${String(negativeCases.length + 1).padStart(3, "0")}`,
      scenario: "Duplicate resource creation",
      priority: "High",
      input: hasBody ? JSON.stringify(parsedBody, null, 2) : "(empty body)",
      expectedStatus: "409",
      expectedResult: "Conflict: resource already exists",
    });
  }

  const edgeCases: TestCase[] = [
    {
      id: "EDGE-001",
      scenario: "Minimum values for numeric fields",
      priority: "Medium",
      input: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, typeof parsedBody[f] === "number" ? 0 : ""])), null, 2) : "(empty body)",
      expectedStatus: "400",
      expectedResult: "Validation error or accepted based on business rules",
    },
    {
      id: "EDGE-002",
      scenario: "Maximum values for numeric fields",
      priority: "Medium",
      input: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, typeof parsedBody[f] === "number" ? Number.MAX_SAFE_INTEGER : "x".repeat(1000)])), null, 2) : "(empty body)",
      expectedStatus: "400",
      expectedResult: "Validation error: value exceeds maximum",
    },
    {
      id: "EDGE-003",
      scenario: "Empty string values",
      priority: "Medium",
      input: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, ""])), null, 2) : "(empty body)",
      expectedStatus: "400",
      expectedResult: "Validation error: empty string not allowed for required fields",
    },
    {
      id: "EDGE-004",
      scenario: "Whitespace-only values",
      priority: "Low",
      input: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, "   "])), null, 2) : "(empty body)",
      expectedStatus: "400",
      expectedResult: "Validation error or trimmed by server",
    },
    {
      id: "EDGE-005",
      scenario: "Unicode and special characters",
      priority: "Low",
      input: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, "测试 🎉 <script>alert(1)</script>"])), null, 2) : "(empty body)",
      expectedStatus: "200/400",
      expectedResult: "Handled safely (sanitized or rejected)",
    },
    {
      id: "EDGE-006",
      scenario: "Large payload",
      priority: "Medium",
      input: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, "x".repeat(10000)])), null, 2) : "(empty body)",
      expectedStatus: "413",
      expectedResult: "Payload too large",
    },
    {
      id: "EDGE-007",
      scenario: "Duplicate request (idempotency)",
      priority: "High",
      input: "Same request sent twice rapidly",
      expectedStatus: isPost ? "201/409" : "200",
      expectedResult: isPost ? "Second request returns conflict or idempotent result" : "Consistent response",
    },
  ];

  const validationCases: TestCase[] = [
    {
      id: "VAL-001",
      scenario: "Required fields validation",
      priority: "Critical",
      input: "Request with missing required fields",
      expectedStatus: "400",
      expectedResult: "Clear validation errors for each missing field",
    },
    {
      id: "VAL-002",
      scenario: "Data type validation",
      priority: "High",
      input: "Request with incorrect data types",
      expectedStatus: "400",
      expectedResult: "Type-specific validation errors",
    },
    {
      id: "VAL-003",
      scenario: "Format validation (email, UUID, date, etc.)",
      priority: "High",
      input: "Request with invalid format values",
      expectedStatus: "400",
      expectedResult: "Format validation errors with details",
    },
  ];

  if (numericFields.length > 0) {
    validationCases.push({
      id: "VAL-004",
      scenario: "Numeric range validation",
      priority: "High",
      input: "Request with out-of-range numeric values",
      expectedStatus: "400",
      expectedResult: "Range validation errors",
    });
  }

  if (fields.length > 1) {
    validationCases.push({
      id: `VAL-${String(validationCases.length + 1).padStart(3, "0")}`,
      scenario: "Cross-field dependency validation",
      priority: "Medium",
      input: "Request with conflicting field values",
      expectedStatus: "400",
      expectedResult: "Cross-field validation error",
    });
  }

  const authCases: TestCase[] = [];
  if (needsAuth) {
    authCases.push(
      {
        id: "AUTH-001",
        scenario: "Missing authentication credentials",
        priority: "Critical",
        input: "Request without Authorization header",
        expectedStatus: "401",
        expectedResult: "Authentication required",
      },
      {
        id: "AUTH-002",
        scenario: "Invalid authentication credentials",
        priority: "Critical",
        input: `Invalid ${auth.toLowerCase()}`,
        expectedStatus: "401",
        expectedResult: "Invalid credentials",
      },
      {
        id: "AUTH-003",
        scenario: "Expired authentication credentials",
        priority: "High",
        input: `Expired ${auth.toLowerCase()}`,
        expectedStatus: "401",
        expectedResult: "Token expired",
      },
      {
        id: "AUTH-004",
        scenario: "Insufficient permissions (authorization)",
        priority: "Critical",
        input: "Valid auth but insufficient role/permissions",
        expectedStatus: "403",
        expectedResult: "Forbidden: insufficient permissions",
      },
      {
        id: "AUTH-005",
        scenario: "IDOR/BOLA - accessing another user's resource",
        priority: "Critical",
        input: "Valid auth but different user's resource ID",
        expectedStatus: "403/404",
        expectedResult: "Forbidden or not found (no data leakage)",
      }
    );
  }

  const securityCases: TestCase[] = [
    {
      id: "SEC-001",
      scenario: "SQL/NoSQL injection in input fields",
      priority: "Critical",
      input: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, "' OR 1=1 --"])), null, 2) : "' OR 1=1 -- in query/path parameter",
      expectedStatus: "400",
      expectedResult: "Input sanitized/rejected, no injection",
    },
    {
      id: "SEC-002",
      scenario: "XSS payload in string fields",
      priority: "High",
      input: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, "<script>alert('xss')</script>"])), null, 2) : "<script>alert('xss')</script> in parameter",
      expectedStatus: "400/200",
      expectedResult: "Payload sanitized or encoded in response",
    },
    {
      id: "SEC-003",
      scenario: "Parameter tampering",
      priority: "High",
      input: "Modified hidden/readonly parameters",
      expectedStatus: "400/403",
      expectedResult: "Server ignores or rejects tampered parameters",
    },
    {
      id: "SEC-004",
      scenario: "Mass assignment / overposting",
      priority: "High",
      input: hasBody ? JSON.stringify({ ...parsedBody, isAdmin: true, role: "admin" }, null, 2) : "Extra query parameters (isAdmin=true)",
      expectedStatus: "400/200",
      expectedResult: "Extra fields ignored or rejected",
    },
    {
      id: "SEC-005",
      scenario: "Rate limiting",
      priority: "Medium",
      input: "Rapid sequential requests (100+ in short time)",
      expectedStatus: "429",
      expectedResult: "Rate limit enforced with retry-after header",
    },
    {
      id: "SEC-006",
      scenario: "Oversized payload",
      priority: "Medium",
      input: "Request body exceeding size limits",
      expectedStatus: "413",
      expectedResult: "Payload too large error",
    },
  ];

  const statusCodes: StatusCode[] = [
    { scenario: isPost ? "Successful creation" : "Successful retrieval/update", statusCode: isPost ? "201" : "200", reason: "Request processed successfully" },
    { scenario: "Validation error", statusCode: "400", reason: "Invalid request data" },
    { scenario: "Authentication required", statusCode: "401", reason: "Missing or invalid credentials" },
    { scenario: "Insufficient permissions", statusCode: "403", reason: "Authenticated but not authorized" },
    { scenario: "Resource not found", statusCode: "404", reason: "Requested resource does not exist" },
    { scenario: "Conflict (duplicate)", statusCode: "409", reason: "Resource already exists" },
    { scenario: "Rate limited", statusCode: "429", reason: "Too many requests" },
    { scenario: "Server error", statusCode: "500", reason: "Internal server error" },
  ];

  const sampleRequests: SampleRequest[] = [
    {
      label: "Valid Request",
      json: hasBody ? JSON.stringify(parsedBody, null, 2) : "{}",
      curl: `curl -X ${method} "${endpoint}" \\\n  -H "Content-Type: application/json"${curlAuth} \\\n  ${hasBody ? `-d '${JSON.stringify(parsedBody)}'` : ""}`,
    },
    {
      label: "Invalid Request (missing required fields)",
      json: hasBody ? JSON.stringify(Object.fromEntries(requiredFields.map(f => [f, null])), null, 2) : "{}",
      curl: `curl -X ${method} "${endpoint}" \\\n  -H "Content-Type: application/json"${curlAuth} \\\n  ${hasBody ? `-d '${JSON.stringify(Object.fromEntries(requiredFields.map(f => [f, null])))}'` : ""}`,
    },
  ];

  if (numericFields.length > 0) {
    sampleRequests.push({
      label: "Boundary Request (max values)",
      json: JSON.stringify(Object.fromEntries(fields.map(f => [f, typeof parsedBody[f] === "number" ? 999999 : "x".repeat(100)])), null, 2),
      curl: `curl -X ${method} "${endpoint}" \\\n  -H "Content-Type: application/json"${curlAuth} \\\n  -d '${JSON.stringify(Object.fromEntries(fields.map(f => [f, typeof parsedBody[f] === "number" ? 999999 : "x".repeat(100)])))}'`,
    });
  }

  sampleRequests.push({
    label: "Security Test (SQL Injection)",
    json: hasBody ? JSON.stringify(Object.fromEntries(fields.map(f => [f, "' OR 1=1 --"])), null, 2) : "{}",
    curl: `curl -X ${method} "${endpoint}" \\\n  -H "Content-Type: application/json"${curlAuth} \\\n  -d '${JSON.stringify(Object.fromEntries(fields.map(f => [f, "' OR 1=1 --"])))}'`,
  });

  return {
    summary: {
      endpoint,
      method,
      purpose: expectedBehaviour || `${method} ${endpoint}`,
      assumptions: [
        "Request body schema inferred from provided example",
        "Authentication type determines auth test cases",
        "ID parameters in path require IDOR/BOLA testing",
        "Business rules inferred from expected behaviour description",
      ],
      risks: [
        "Missing authentication validation",
        "Potential IDOR/BOLA on resource endpoints",
        "Insufficient input validation for injection attacks",
        "Rate limiting may not be implemented",
        "Sensitive data exposure in error responses",
      ],
    },
    positive: positiveCases,
    negative: negativeCases,
    edge: edgeCases,
    validation: validationCases,
    authentication: authCases,
    security: securityCases,
    statusCodes,
    sampleRequests,
    meta: { provider: "offline", generatedAt: new Date().toISOString() },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { endpoint, method, authType, requestBody, expectedBehaviour } = body as {
      endpoint?: string;
      method?: string;
      authType?: string;
      requestBody?: string;
      expectedBehaviour?: string;
    };

    if (!endpoint || typeof endpoint !== "string" || !endpoint.trim()) {
      return NextResponse.json({ error: "Please enter an API endpoint." }, { status: 400 });
    }
    if (!method || typeof method !== "string") {
      return NextResponse.json({ error: "Please select an HTTP method." }, { status: 400 });
    }
    if (!expectedBehaviour || typeof expectedBehaviour !== "string" || expectedBehaviour.trim().length < 10) {
      return NextResponse.json(
        { error: "Please describe the expected behaviour (at least 10 characters)." },
        { status: 400 }
      );
    }
    if (requestBody && typeof requestBody === "string" && requestBody.trim()) {
      try {
        JSON.parse(requestBody);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON. Please fix the request body before generating the test plan." },
          { status: 400 }
        );
      }
    }

    const cleanEndpoint = endpoint.trim();
    const cleanMethod = method.trim().toUpperCase();
    const cleanAuth = typeof authType === "string" && authType ? authType : "None";
    const cleanBody = typeof requestBody === "string" ? requestBody : "";
    const cleanBehaviour = expectedBehaviour.trim();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      // Offline fallback: dynamic plan derived from the actual API definition.
      const mockPlan = generateMockTestPlan(cleanEndpoint, cleanMethod, cleanAuth, cleanBody, cleanBehaviour);
      return NextResponse.json(mockPlan);
    }

    const userPrompt = `API Definition:
Endpoint: ${cleanEndpoint}
HTTP Method: ${cleanMethod}
Authentication: ${cleanAuth}
Request Body: ${cleanBody || "(empty)"}
Expected Behaviour: ${cleanBehaviour}

Generate a comprehensive API reliability test plan as structured JSON.`;

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 8000,
          response_format: { type: "json_object" },
        }),
      });
    } catch {
      return NextResponse.json(
        { error: "Generation failed. We couldn't reach the AI service. Please check your connection and try again." },
        { status: 502 }
      );
    }

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limited by the AI service. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "AI service rejected the request (invalid API key). Please check server configuration and try again." },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: "Generation failed. We couldn't generate the test plan. Please check your connection and try again." },
        { status: 502 }
      );
    }

    const data = await response.json().catch(() => null);
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Unable to parse AI response. Please try generating the test plan again." },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripJsonFences(content));
    } catch {
      console.error("Failed to parse AI response as JSON");
      return NextResponse.json(
        { error: "Unable to parse AI response. Please try generating the test plan again." },
        { status: 502 }
      );
    }

    const testPlan = normalizePlan(parsed, cleanEndpoint, cleanMethod);
    const total =
      testPlan.positive.length +
      testPlan.negative.length +
      testPlan.edge.length +
      testPlan.validation.length +
      testPlan.authentication.length +
      testPlan.security.length;
    if (total === 0) {
      return NextResponse.json(
        { error: "Unable to parse AI response. Please try generating the test plan again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ...testPlan, meta: { provider: "openai", generatedAt: new Date().toISOString() } });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Generation failed. We couldn't generate the test plan. Please check your connection and try again." },
      { status: 500 }
    );
  }
}
