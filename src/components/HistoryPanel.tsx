"use client";

import { useState, useEffect } from "react";
import type { HistoryItem, TestPlan } from "@/lib/types";

interface HistoryPanelProps {
  onRestore: (item: HistoryItem) => void;
  currentResult?: TestPlan;
  refreshKey?: number;
}

const STORAGE_KEY = "api-reliability-history";

function loadStoredHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load history:", e);
  }
  return [];
}

export function HistoryPanel({ onRestore, currentResult, refreshKey }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHistory(loadStoredHistory());
  }, [refreshKey]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setHistory(loadStoredHistory());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  };

  const deleteItem = (id: string) => {
    saveHistory(history.filter(h => h.id !== id));
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const isCurrentItem = (item: HistoryItem) => {
    if (!currentResult) return false;
    return JSON.stringify(item.result) === JSON.stringify(currentResult);
  };

  if (history.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isOpen}
        aria-controls="history-content"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg" aria-hidden="true">🕐</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">History</span>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {history.length}
          </span>
        </div>
        <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div id="history-content" className={`${isOpen ? "block" : "hidden"}`} role="region" aria-label="History items">
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded border transition-colors ${
                isCurrentItem(item)
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
              role="button"
              tabIndex={0}
              onClick={() => onRestore(item)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRestore(item); } }}
              aria-current={isCurrentItem(item) ? "true" : "false"}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                      {item.method}
                    </code>
                    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-900 dark:text-gray-100 truncate">
                      {item.endpoint}
                    </code>
                    {isCurrentItem(item) && (
                      <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{formatDate(item.timestamp)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                    Total tests: {(item.result.positive?.length||0)+(item.result.negative?.length||0)+(item.result.edge?.length||0)+(item.result.validation?.length||0)+(item.result.authentication?.length||0)+(item.result.security?.length||0)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  aria-label={`Delete ${item.method} ${item.endpoint} from history`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
            >
              Clear History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}