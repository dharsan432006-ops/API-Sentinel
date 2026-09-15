"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";
import type { SampleRequest } from "@/lib/types";

interface SampleRequestsSectionProps {
  sampleRequests: SampleRequest[];
}

export function SampleRequestsSection({ sampleRequests }: SampleRequestsSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (sampleRequests.length === 0) return null;

  const flash = (key: string) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
  };

  const handleCopyJson = (json: string, index: number) => {
    copyToClipboard(json).then(() => flash(`json-${index}`)).catch(() => {});
  };

  const handleCopyCurl = (curl: string, index: number) => {
    copyToClipboard(curl).then(() => flash(`curl-${index}`)).catch(() => {});
  };

  const handleCopyAll = () => {
    const text = sampleRequests.map(sr => 
      `## ${sr.label}\n\n### JSON\n\`\`\`json\n${sr.json}\n\`\`\`\n\n### cURL\n\`\`\`bash\n${sr.curl}\n\`\`\``
    ).join("\n\n");
    copyToClipboard(text).then(() => flash("all")).catch(() => {});
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-lg" aria-hidden="true">📦</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">Sample Requests</span>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {sampleRequests.length}
          </span>
        </div>
        <button
          onClick={handleCopyAll}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label={copiedKey === "all" ? "Copied all sample requests to clipboard" : "Copy all sample requests"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {copiedKey === "all" ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            )}
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-6">
        {sampleRequests.map((sr, index) => (
          <div key={index} className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6 first:border-0 first:pt-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{sr.label}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyJson(sr.json, index)}
                  className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Copy JSON for ${sr.label}`}
                >
                  {copiedKey === `json-${index}` ? "Copied to clipboard" : "Copy JSON"}
                </button>
                <button
                  onClick={() => handleCopyCurl(sr.curl, index)}
                  className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Copy cURL for ${sr.label}`}
                >
                  {copiedKey === `curl-${index}` ? "Copied to clipboard" : "Copy cURL"}
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">JSON</label>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto max-h-64">
                  {sr.json}
                </pre>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">cURL</label>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto max-h-64">
                  {sr.curl}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}