export interface TestCase {
  id: string;
  scenario: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  input: string;
  expectedStatus: string;
  expectedResult: string;
}

export interface StatusCode {
  scenario: string;
  statusCode: string;
  reason: string;
}

export interface SampleRequest {
  label: string;
  json: string;
  curl: string;
}

export interface TestPlan {
  summary: {
    endpoint: string;
    method: string;
    purpose: string;
    assumptions: string[];
    risks: string[];
  };
  positive: TestCase[];
  negative: TestCase[];
  edge: TestCase[];
  validation: TestCase[];
  authentication: TestCase[];
  security: TestCase[];
  statusCodes: StatusCode[];
  sampleRequests: SampleRequest[];
  meta?: {
    provider: "openai" | "offline";
    generatedAt: string;
  };
}

export interface HistoryItem {
  id: string;
  endpoint: string;
  method: string;
  requestBody: string;
  expectedBehaviour: string;
  timestamp: number;
  result: TestPlan;
}

export interface FormData {
  endpoint: string;
  method: string;
  authType: string;
  requestBody: string;
  expectedBehaviour: string;
}

export type ValidationErrors = Partial<Record<keyof FormData, string>>;