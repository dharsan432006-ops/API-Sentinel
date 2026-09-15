"use client";

import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import { formatJson, isValidJson } from "@/lib/utils";
import { HTTP_METHODS, AUTH_TYPES } from "@/lib/prompt";
import type { FormData, ValidationErrors } from "@/lib/types";

interface ApiConfigFormProps {
  onGenerate: (data: FormData) => void;
  isLoading: boolean;
  onLoadExample: (example: FormData) => void;
  initialValues?: FormData;
}

function isValidEndpoint(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith("/")) return v.length >= 2;
  if (v.startsWith("http://") || v.startsWith("https://")) {
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }
  return /^[A-Za-z0-9_~.\-/{}\s:]+$/.test(v) && v.replace(/[\s/]/g, "").length > 0;
}

export function ApiConfigForm({ onGenerate, isLoading, onLoadExample, initialValues }: ApiConfigFormProps) {
  const [formData, setFormData] = useState<FormData>(
    initialValues ?? {
      endpoint: "",
      method: "POST",
      authType: "Bearer Token",
      requestBody: "",
      expectedBehaviour: "",
    }
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [jsonError, setJsonError] = useState<string | null>(null);

  // NOTE: parent remounts this form via `key` whenever an example or history
  // item is loaded, so `initialValues` is consumed once as initial state.

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.endpoint.trim()) {
      newErrors.endpoint = "Please enter an API endpoint.";
    } else if (!isValidEndpoint(formData.endpoint)) {
      newErrors.endpoint = "Please enter a valid endpoint (e.g. /api/users or https://api.example.com/users).";
    }
    if (!formData.method) {
      newErrors.method = "Please select an HTTP method.";
    }
    if (!formData.expectedBehaviour.trim()) {
      newErrors.expectedBehaviour = "Please describe the expected behaviour.";
    } else if (formData.expectedBehaviour.trim().length < 10) {
      newErrors.expectedBehaviour = "Please describe the expected behaviour in more detail (at least 10 characters).";
    }
    if (formData.requestBody.trim() && !isValidJson(formData.requestBody)) {
      newErrors.requestBody = "Invalid JSON. Please fix the request body before generating the test plan.";
      setJsonError("Invalid JSON. Please fix the request body before generating the test plan.");
    } else {
      setJsonError(null);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onGenerate(formData);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFormatJson = () => {
    const formatted = formatJson(formData.requestBody);
    setFormData((prev) => ({ ...prev, requestBody: formatted }));
    setJsonError(null);
  };

  const handleClearJson = () => {
    setFormData((prev) => ({ ...prev, requestBody: "" }));
    setJsonError(null);
  };

  const handleLoadExample = (example: FormData) => {
    setFormData(example);
    setErrors({});
    setJsonError(null);
    onLoadExample(example);
  };

  const methodsRequiringBody = ["POST", "PUT", "PATCH"];

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          API Endpoint <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          id="endpoint"
          value={formData.endpoint}
          onChange={(e) => handleChange("endpoint", e.target.value)}
          placeholder="/api/users or https://api.example.com/users"
          className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 
            ${errors.endpoint ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"}
            focus:outline-none focus:ring-2 focus:border-transparent`}
          aria-invalid={errors.endpoint ? "true" : "false"}
          aria-describedby={errors.endpoint ? "endpoint-error" : undefined}
          disabled={isLoading}
        />
        {errors.endpoint && (
          <p id="endpoint-error" className="text-sm text-red-500" role="alert">{errors.endpoint}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="method" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          HTTP Method <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id="method"
          value={formData.method}
          onChange={(e) => handleChange("method", e.target.value)}
          className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800
            ${errors.method ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"}
            focus:outline-none focus:ring-2 focus:border-transparent`}
          aria-invalid={errors.method ? "true" : "false"}
          disabled={isLoading}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {errors.method && <p className="text-sm text-red-500" role="alert">{errors.method}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="authType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Authentication
        </label>
        <select
          id="authType"
          value={formData.authType}
          onChange={(e) => handleChange("authType", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          {AUTH_TYPES.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Never enter real secrets. Use placeholders like{" "}
          <code className="text-gray-600 dark:text-gray-300">{"<BEARER_TOKEN>"}</code>{" "}
          or{" "}
          <code className="text-gray-600 dark:text-gray-300">{"<API_KEY>"}</code>
          .
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="requestBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Request Body (JSON)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFormatJson}
              className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || !formData.requestBody.trim()}
              aria-label="Format JSON"
            >
              Format
            </button>
            <button
              type="button"
              onClick={handleClearJson}
              className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || !formData.requestBody.trim()}
              aria-label="Clear JSON"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          id="requestBody"
          value={formData.requestBody}
          onChange={(e) => handleChange("requestBody", e.target.value)}
          placeholder={methodsRequiringBody.includes(formData.method) ? '{"name": "John", "email": "john@example.com"}' : "Optional for GET/DELETE"}
          rows={6}
          className={`w-full px-3 py-2 text-sm font-mono border rounded-md bg-white dark:bg-gray-800
            ${errors.requestBody || jsonError ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"}
            focus:outline-none focus:ring-2 focus:border-transparent`}
          aria-invalid={(errors.requestBody || jsonError) ? "true" : "false"}
          aria-describedby={errors.requestBody ? "requestBody-error" : jsonError ? "requestBody-json-error" : undefined}
          disabled={isLoading}
          spellCheck={false}
        />
        {(errors.requestBody || jsonError) && (
          <p id={errors.requestBody ? "requestBody-error" : "requestBody-json-error"} className="text-sm text-red-500" role="alert">
            {errors.requestBody || jsonError}
          </p>
        )}
        {!methodsRequiringBody.includes(formData.method) && (
          <p className="text-xs text-gray-500 dark:text-gray-400">Request body is optional for {formData.method} requests.</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="expectedBehaviour" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Expected Behaviour <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="expectedBehaviour"
          value={formData.expectedBehaviour}
          onChange={(e) => handleChange("expectedBehaviour", e.target.value)}
          placeholder='e.g., "Creates a new user when valid information is provided. Email addresses must be unique."'
          rows={3}
          className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800
            ${errors.expectedBehaviour ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"}
            focus:outline-none focus:ring-2 focus:border-transparent`}
          aria-invalid={errors.expectedBehaviour ? "true" : "false"}
          aria-describedby={errors.expectedBehaviour ? "expectedBehaviour-error" : undefined}
          disabled={isLoading}
        />
        {errors.expectedBehaviour && (
          <p id="expectedBehaviour-error" className="text-sm text-red-500" role="alert">{errors.expectedBehaviour}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 min-w-[200px] px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generating..." : "Generate Test Plan"}
        </button>
      </div>
    </form>
  );
}