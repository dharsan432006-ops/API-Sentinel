"use client";

import { useState } from "react";
import { TestCaseRow } from "./TestCaseRow";
import { copyToClipboard } from "@/lib/utils";
import type { TestCase } from "@/lib/types";

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  testCases: TestCase[];
  defaultOpen?: boolean;
}

export function CollapsibleSection({ title, icon, testCases, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopySection = () => {
    const text = testCases.map(tc => 
      `ID: ${tc.id}\nScenario: ${tc.scenario}\nPriority: ${tc.priority}\nInput: ${tc.input}\nExpected Status: ${tc.expectedStatus}\nExpected Result: ${tc.expectedResult}`
    ).join("\n\n---\n\n");
    copyToClipboard(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  if (testCases.length === 0) return null;

  const contentId = `${title.replace(/\s+/g, '-').toLowerCase()}-content`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="w-full px-4 py-3 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50">
        <span className="text-lg" aria-hidden="true">{icon}</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="font-medium text-gray-900 dark:text-gray-100 flex-1 text-left hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          {title}
        </button>
        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
          {testCases.length}
        </span>
        <button
          onClick={handleCopySection}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label={copied ? `Copied ${title} to clipboard` : `Copy ${title}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {copied ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            )}
          </svg>
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-expanded={isOpen}
          aria-controls={contentId}
          aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
        >
          <svg className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div 
        id={contentId} 
        className={`${isOpen ? "block" : "hidden"}`} 
        role="region" 
        aria-label={title}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left" role="table">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scenario</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Status</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Result</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc) => (
                <TestCaseRow key={tc.id} testCase={tc} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}