"use client";

import { EXAMPLE_APIS } from "@/lib/prompt";
import type { FormData } from "@/lib/types";

interface ExampleCardsProps {
  onLoadExample: (example: FormData) => void;
  hasResult: boolean;
}

export function ExampleCards({ onLoadExample, hasResult }: ExampleCardsProps) {
  if (hasResult) return null;

  return (
    <div className="space-y-4" role="region" aria-label="Example APIs">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Try an example</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLE_APIS.map((example, index) => (
          <button
            key={index}
            onClick={() => onLoadExample({
              endpoint: example.endpoint,
              method: example.method,
              authType: example.authType,
              requestBody: example.requestBody,
              expectedBehaviour: example.expectedBehaviour,
            })}
            className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center gap-2 mb-2">
              <code className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-mono font-medium">
                {example.method}
              </code>
              <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-900 dark:text-gray-100 truncate">
                {example.endpoint}
              </code>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{example.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{example.expectedBehaviour}</p>
            {example.requestBody && (
              <pre className="mt-2 p-2 bg-gray-900 text-gray-100 rounded text-xs font-mono overflow-x-auto max-h-24">
                {example.requestBody}
              </pre>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}