"use client";

import { useState } from "react";
import { copyToClipboard, getStatusBadgeClass } from "@/lib/utils";
import type { StatusCode } from "@/lib/types";

interface StatusCodesSectionProps {
  statusCodes: StatusCode[];
}

export function StatusCodesSection({ statusCodes }: StatusCodesSectionProps) {
  const [copied, setCopied] = useState(false);

  if (statusCodes.length === 0) return null;

  const handleCopy = () => {
    const text = statusCodes.map(sc => 
      `Scenario: ${sc.scenario}\nStatus Code: ${sc.statusCode}\nReason: ${sc.reason}`
    ).join("\n\n");
    copyToClipboard(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-lg" aria-hidden="true">🌐</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">Expected HTTP Status Codes</span>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {statusCodes.length}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Copy status codes"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {copied ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            )}
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-left" role="table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scenario</th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status Code</th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
            </tr>
          </thead>
          <tbody>
            {statusCodes.map((sc, index) => (
              <tr key={index} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{sc.scenario}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${getStatusBadgeClass(sc.statusCode)}`}>
                    {sc.statusCode}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{sc.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}