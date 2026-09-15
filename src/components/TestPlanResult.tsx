"use client";

import { useState } from "react";
import { copyToClipboard, downloadJson, generateMarkdown, generateCurlCommands, countTotalTests, countCriticalHigh } from "@/lib/utils";
import { CollapsibleSection } from "./CollapsibleSection";
import { StatusCodesSection } from "./StatusCodesSection";
import { SampleRequestsSection } from "./SampleRequestsSection";
import { SECTION_CONFIG } from "@/lib/prompt";
import type { TestPlan, FormData } from "@/lib/types";

interface TestPlanResultProps {
  testPlan: TestPlan;
  formData: FormData;
}

export function TestPlanResult({ testPlan, formData }: TestPlanResultProps) {
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleCopyJson = () => {
    copyToClipboard(JSON.stringify(testPlan, null, 2)).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }).catch(() => {});
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown(testPlan, formData);
    copyToClipboard(md).then(() => {
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    }).catch(() => {});
  };

  const handleCopyCurl = () => {
    const curl = generateCurlCommands(testPlan, formData);
    copyToClipboard(curl).then(() => {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }).catch(() => {});
  };

  const handleDownloadJson = () => {
    const filename = `test-plan-${formData.method}-${formData.endpoint.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
    downloadJson(testPlan, filename);
  };

  const totalTests = countTotalTests(testPlan);
  const criticalHigh = countCriticalHigh(testPlan);
  const coverage = totalTests > 0 ? Math.round((criticalHigh / totalTests) * 100) : 0;
  const isOffline = testPlan.meta?.provider === "offline";

  return (
    <div className="space-y-6" role="region" aria-label="Test plan results">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">API Reliability Test Plan</h2>
          {isOffline && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full" title="No AI API key configured on the server, so this plan was derived locally from your API definition.">
              Offline plan
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
              {formData.method}
            </code>
            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-gray-100 truncate max-w-xs">
              {formData.endpoint}
            </code>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-4 ml-2">
            <span>Total Tests: <strong className="text-gray-900 dark:text-gray-100">{totalTests}</strong></span>
            <span>Positive: <strong className="text-gray-900 dark:text-gray-100">{testPlan.positive?.length || 0}</strong></span>
            <span>Negative: <strong className="text-gray-900 dark:text-gray-100">{testPlan.negative?.length || 0}</strong></span>
            <span>Edge: <strong className="text-gray-900 dark:text-gray-100">{testPlan.edge?.length || 0}</strong></span>
            <span>Validation: <strong className="text-gray-900 dark:text-gray-100">{testPlan.validation?.length || 0}</strong></span>
            <span>Auth: <strong className="text-gray-900 dark:text-gray-100">{testPlan.authentication?.length || 0}</strong></span>
            <span>Security: <strong className="text-gray-900 dark:text-gray-100">{testPlan.security?.length || 0}</strong></span>
            <span className="text-red-600 dark:text-red-400">Critical/High: <strong>{criticalHigh}</strong></span>
            <span>Coverage: <strong className="text-gray-900 dark:text-gray-100">{coverage}% critical/high</strong></span>
          </div>
        </div>

        {(testPlan.summary?.purpose || testPlan.summary?.assumptions?.length || testPlan.summary?.risks?.length) ? (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md text-sm">
            {testPlan.summary?.purpose ? (
              <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium">Purpose:</strong> {testPlan.summary.purpose}</p>
            ) : null}
            {testPlan.summary?.assumptions?.length ? (
              <div className="mt-2">
                <p className="font-medium text-gray-700 dark:text-gray-300">Assumptions:</p>
                <ul className="list-disc ml-5 mt-1 text-gray-600 dark:text-gray-400">
                  {testPlan.summary.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            ) : null}
            {testPlan.summary?.risks?.length ? (
              <div className="mt-2">
                <p className="font-medium text-gray-700 dark:text-gray-300">Potential reliability risks:</p>
                <ul className="list-disc ml-5 mt-1 text-gray-600 dark:text-gray-400">
                  {testPlan.summary.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Copy JSON"
          >
            {copiedJson ? "Copied to clipboard" : "Copy JSON"}
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Copy as Markdown"
          >
            {copiedMarkdown ? "Copied to clipboard" : "Copy Markdown"}
          </button>
          <button
            onClick={handleCopyCurl}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Copy cURL commands"
          >
            {copiedCurl ? "Copied to clipboard" : "Copy cURL Commands"}
          </button>
          <button
            onClick={handleDownloadJson}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Download JSON"
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="space-y-4" role="list" aria-label="Test case sections">
        {SECTION_CONFIG.map(({ key, label, icon }) => (
          <CollapsibleSection
            key={key}
            title={label}
            icon={icon}
            testCases={testPlan[key as keyof typeof testPlan] as any[] || []}
            defaultOpen={key === "positive" || key === "negative"}
          />
        ))}
        <StatusCodesSection statusCodes={testPlan.statusCodes || []} />
        <SampleRequestsSection sampleRequests={testPlan.sampleRequests || []} />
      </div>
    </div>
  );
}