"use client";

import { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "@/lib/prompt";

export function LoadingSkeleton() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-label="Generating test plan">
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
        <span>{LOADING_MESSAGES[messageIndex]}</span>
      </div>

      <div className="space-y-4" aria-hidden="true">
        {SECTION_SKELETONS.map((section, i) => (
          <div key={i} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-2 ml-10">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="grid grid-cols-[1fr_80px_1fr_1fr_1fr] gap-3 text-xs">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SECTION_SKELETONS = [
  "Positive Test Cases",
  "Negative Test Cases",
  "Edge Cases",
  "Validation Checks",
  "Authentication & Authorization",
  "Security Checks",
  "HTTP Status Codes",
  "Sample Requests",
];