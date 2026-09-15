"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export function PromptPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(SYSTEM_PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isOpen}
        aria-controls="prompt-preview-content"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg" aria-hidden="true">📋</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">Prompt Preview</span>
        </div>
        <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div id="prompt-preview-content" className={`${isOpen ? "block" : "hidden"}`} role="region" aria-label="System prompt">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Prompt</span>
            <button
              onClick={handleCopy}
              className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Copy system prompt"
            >
              {copied ? "Copied to clipboard" : "Copy Prompt"}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            This is the actual system instruction sent with every generation. It guides the AI&apos;s QA analysis, relevance rules, and JSON output format.
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm font-mono overflow-x-auto max-h-96 whitespace-pre-wrap">
            {SYSTEM_PROMPT}
          </pre>
        </div>
      </div>
    </div>
  );
}