"use client";

import { useState } from "react";
import { getPriorityClass, getStatusBadgeClass, copyToClipboard } from "@/lib/utils";
import type { TestCase } from "@/lib/types";

interface TestCaseRowProps {
  testCase: TestCase;
}

export function TestCaseRow({ testCase }: TestCaseRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `ID: ${testCase.id}\nScenario: ${testCase.scenario}\nPriority: ${testCase.priority}\nInput: ${testCase.input}\nExpected Status: ${testCase.expectedStatus}\nExpected Result: ${testCase.expectedResult}`;
    copyToClipboard(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-3 py-2 font-mono text-xs font-medium text-gray-900 dark:text-gray-100">{testCase.id}</td>
      <td className="px-3 py-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityClass(testCase.priority)}`}>
          {testCase.priority}
        </span>
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 max-w-md truncate" title={testCase.scenario}>
        {testCase.scenario}
      </td>
      <td className="px-3 py-2">
        <code className="text-xs font-mono text-gray-600 dark:text-gray-400 block max-w-xs truncate" title={testCase.input}>
          {testCase.input}
        </code>
      </td>
      <td className="px-3 py-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${getStatusBadgeClass(testCase.expectedStatus)}`}>
          {testCase.expectedStatus}
        </span>
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 max-w-md truncate" title={testCase.expectedResult}>
        {testCase.expectedResult}
      </td>
      <td className="px-3 py-2 text-right">
        <button
          onClick={handleCopy}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label={`Copy test case ${testCase.id}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {copied ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            )}
          </svg>
        </button>
      </td>
    </tr>
  );
}