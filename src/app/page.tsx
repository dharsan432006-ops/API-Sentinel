"use client";

import { useState, useCallback } from "react";
import { ApiConfigForm } from "@/components/ApiConfigForm";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { TestPlanResult } from "@/components/TestPlanResult";
import { HistoryPanel } from "@/components/HistoryPanel";
import { PromptPreview } from "@/components/PromptPreview";
import { ExampleCards } from "@/components/ExampleCards";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { addToHistory } from "@/lib/utils";
import type { FormData, TestPlan, ValidationErrors, HistoryItem } from "@/lib/types";

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>({
    endpoint: "",
    method: "POST",
    authType: "Bearer Token",
    requestBody: "",
    expectedBehaviour: "",
  });
  const [formKey, setFormKey] = useState(0);
  const [historyKey, setHistoryKey] = useState(0);
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateForm = useCallback((data: FormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    const endpoint = data.endpoint.trim();
    if (!endpoint) {
      errors.endpoint = "Please enter an API endpoint.";
    } else if (
      !(
        endpoint.startsWith("/") ||
        endpoint.startsWith("http://") ||
        endpoint.startsWith("https://")
      )
    ) {
      errors.endpoint = "Please enter a valid endpoint (e.g. /api/users or https://api.example.com/users).";
    }
    if (!data.method) errors.method = "Please select an HTTP method.";
    if (!data.expectedBehaviour.trim()) {
      errors.expectedBehaviour = "Please describe the expected behaviour.";
    } else if (data.expectedBehaviour.trim().length < 10) {
      errors.expectedBehaviour = "Please describe the expected behaviour in more detail (at least 10 characters).";
    }
    if (data.requestBody.trim()) {
      try { JSON.parse(data.requestBody); }
      catch { errors.requestBody = "Invalid JSON. Please fix the request body before generating the test plan."; }
    }
    return errors;
  }, []);

  const handleGenerate = async (data: FormData) => {
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setError(null);
    setIsLoading(true);
    setFormData(data);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed: ${response.status}`);
      }

      const result: TestPlan = await response.json();
      setTestPlan(result);
      addToHistory({ endpoint: data.endpoint, method: data.method, requestBody: data.requestBody, expectedBehaviour: data.expectedBehaviour, result });
      setHistoryKey((k) => k + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "We couldn't generate the test plan. Please try again.";
      setError(
        /failed to fetch|networkerror|load failed/i.test(message)
          ? "Generation failed. We couldn't generate the test plan. Please check your connection and try again."
          : message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleGenerate(formData);
  };

  const handleLoadExample = (example: FormData) => {
    setFormData(example);
    setFormKey((k) => k + 1);
    setValidationErrors({});
    setError(null);
    setTestPlan(null);
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setFormData({
      endpoint: item.endpoint,
      method: item.method,
      authType: "Bearer Token",
      requestBody: item.requestBody,
      expectedBehaviour: item.expectedBehaviour,
    });
    setFormKey((k) => k + 1);
    setTestPlan(item.result);
    setError(null);
    setValidationErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API Sentinel</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                AI-Powered API Reliability &amp; Security Assistant
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">API Configuration</h2>
                <ApiConfigForm
                  key={formKey}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  onLoadExample={handleLoadExample}
                  initialValues={formData}
                />
              </div>

              <ExampleCards onLoadExample={handleLoadExample} hasResult={!!testPlan} />

              <HistoryPanel onRestore={handleRestoreHistory} currentResult={testPlan || undefined} refreshKey={historyKey} />

              <PromptPreview />
            </div>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <ErrorDisplay message={error} onRetry={handleRetry} />
            )}

            {isLoading ? (
              <LoadingSkeleton />
            ) : testPlan ? (
              <TestPlanResult
                testPlan={testPlan}
                formData={formData}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No test plan generated yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Configure an API endpoint and click &quot;Generate Test Plan&quot; to create a comprehensive reliability test plan.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Or try one of the example APIs on the left.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          API Sentinel — Built for Full Stack Intern Assessment
        </div>
      </footer>
    </div>
  );
}