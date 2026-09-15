"use client";

export function formatJson(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
}

export function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) resolve();
      else reject(new Error("Copy failed"));
    } catch (e) {
      reject(e instanceof Error ? e : new Error("Copy failed"));
    }
  });
}

export function downloadJson(data: object, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateMarkdown(testPlan: any, formData: any): string {
  let md = `# API Reliability Test Plan\n\n`;
  md += `**Endpoint:** \`${formData.endpoint}\`  \n`;
  md += `**Method:** \`${formData.method}\`  \n`;
  md += `**Authentication:** ${formData.authType}  \n\n`;

  md += `## Summary\n\n`;
  md += `**Purpose:** ${testPlan.summary?.purpose || "N/A"}\n\n`;
  if (testPlan.summary?.assumptions?.length) {
    md += `**Assumptions:**\n`;
    testPlan.summary.assumptions.forEach((a: string) => {
      md += `- ${a}\n`;
    });
    md += `\n`;
  }
  if (testPlan.summary?.risks?.length) {
    md += `**Potential Reliability Risks:**\n`;
    testPlan.summary.risks.forEach((r: string) => {
      md += `- ${r}\n`;
    });
    md += `\n`;
  }

  const sections = [
    { key: "positive", label: "Positive Test Cases" },
    { key: "negative", label: "Negative Test Cases" },
    { key: "edge", label: "Edge Cases" },
    { key: "validation", label: "Validation Checks" },
    { key: "authentication", label: "Authentication & Authorization" },
    { key: "security", label: "Security Checks" },
  ];

  sections.forEach(({ key, label }) => {
    const cases = testPlan[key];
    if (cases?.length) {
      md += `## ${label}\n\n`;
      cases.forEach((tc: any) => {
        md += `### ${tc.id}: ${tc.scenario}\n\n`;
        md += `- **Priority:** ${tc.priority}\n`;
        md += `- **Input:** \`${tc.input}\`\n`;
        md += `- **Expected Status:** ${tc.expectedStatus}\n`;
        md += `- **Expected Result:** ${tc.expectedResult}\n\n`;
      });
    }
  });

  if (testPlan.statusCodes?.length) {
    md += `## Expected HTTP Status Codes\n\n`;
    md += `| Scenario | Status Code | Reason |\n`;
    md += `|----------|-------------|--------|\n`;
    testPlan.statusCodes.forEach((sc: any) => {
      md += `| ${sc.scenario} | ${sc.statusCode} | ${sc.reason} |\n`;
    });
    md += `\n`;
  }

  if (testPlan.sampleRequests?.length) {
    md += `## Sample Requests\n\n`;
    testPlan.sampleRequests.forEach((sr: any) => {
      md += `### ${sr.label}\n\n`;
      md += `\`\`\`json\n${sr.json}\n\`\`\`\n\n`;
      md += `\`\`\`bash\n${sr.curl}\n\`\`\`\n\n`;
    });
  }

  return md;
}

export function generateCurlCommands(testPlan: any, formData: any): string {
  let output = "";
  testPlan.sampleRequests?.forEach((sr: any) => {
    output += `# ${sr.label}\n${sr.curl}\n\n`;
  });
  return output.trim();
}

export function getStatusBadgeClass(statusCode: string): string {
  const code = parseInt(statusCode);
  if (code >= 200 && code < 300) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  if (code >= 400 && code < 500) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
  if (code >= 500) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
}

export function getPriorityClass(priority: string): string {
  switch (priority) {
    case "Critical": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    case "High": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    case "Medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  }
}

export function countTotalTests(testPlan: any): number {
  return (
    (testPlan.positive?.length || 0) +
    (testPlan.negative?.length || 0) +
    (testPlan.edge?.length || 0) +
    (testPlan.validation?.length || 0) +
    (testPlan.authentication?.length || 0) +
    (testPlan.security?.length || 0)
  );
}

export function countCriticalHigh(testPlan: any): number {
  const allTests = [
    ...(testPlan.positive || []),
    ...(testPlan.negative || []),
    ...(testPlan.edge || []),
    ...(testPlan.validation || []),
    ...(testPlan.authentication || []),
    ...(testPlan.security || []),
  ];
  return allTests.filter((t: any) => t.priority === "Critical" || t.priority === "High").length;
}

export function addToHistory(item: { endpoint: string; method: string; requestBody: string; expectedBehaviour: string; result: any }): void {
  const STORAGE_KEY = "api-reliability-history";
  const MAX_HISTORY = 5;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history = stored ? JSON.parse(stored) : [];
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const newHistory = [newItem, ...history.filter((h: any) => 
      !(h.endpoint === item.endpoint && h.method === item.method && JSON.stringify(h.result) === JSON.stringify(item.result))
    )].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (e) {
    console.error("Failed to save history:", e);
  }
}