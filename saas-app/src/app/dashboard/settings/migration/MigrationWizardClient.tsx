"use client";

import { useState } from "react";
import { executeMigrationAction } from "./actions";
import { MigrationResult } from "@/lib/migration/MigrationEngine";

export default function MigrationWizardClient({
  orgId,
  isOwnerOrAdmin
}: {
  orgId: string;
  isOwnerOrAdmin: boolean;
}) {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewResult, setPreviewResult] = useState<MigrationResult | null>(null);
  const [executionResult, setExecutionResult] = useState<MigrationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonInput(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDryRun = async () => {
    if (!jsonInput.trim()) {
      setErrorMsg("Please upload or paste a valid JSON export file.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setExecutionResult(null);

    try {
      const result = await executeMigrationAction(orgId, jsonInput, true);
      setPreviewResult(result);
      if (!result.success && result.errors.length > 0) {
        setErrorMsg(result.errors.join(", "));
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!jsonInput.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await executeMigrationAction(orgId, jsonInput, false);
      setExecutionResult(result);
      setPreviewResult(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwnerOrAdmin) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-sm text-yellow-700">
          Only Organization Owners and Admins have permission to perform data migration.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Migration Wizard</h2>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Step 1: Input Data */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Step 1: Upload or Paste Legacy JSON Export
        </label>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        <textarea
          rows={6}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"clients": [...], "matters": [...], "tasks": [...]}'
          className="w-full font-mono text-xs p-3 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
        />
        <div className="flex justify-end">
          <button
            onClick={handleDryRun}
            disabled={isLoading || !jsonInput.trim()}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-black disabled:opacity-50"
          >
            {isLoading ? "Validating..." : "Run Dry-Run Validation & Preview"}
          </button>
        </div>
      </div>

      {/* Step 2: Dry Run Preview */}
      {previewResult && previewResult.success && (
        <div className="border border-indigo-100 bg-indigo-50/40 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">
              Step 2: Dry-Run Preview Summary
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded">
              Ready for Confirmation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="text-xs text-gray-500">Clients</span>
              <p className="text-lg font-bold text-gray-900">{previewResult.counts.clients.prospective}</p>
              <span className="text-[10px] text-gray-400">{previewResult.counts.clients.duplicates} duplicates skipped</span>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="text-xs text-gray-500">Matters</span>
              <p className="text-lg font-bold text-gray-900">{previewResult.counts.matters.prospective}</p>
              <span className="text-[10px] text-gray-400">{previewResult.counts.matters.duplicates} duplicates skipped</span>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="text-xs text-gray-500">Tasks</span>
              <p className="text-lg font-bold text-gray-900">{previewResult.counts.tasks.prospective}</p>
              <span className="text-[10px] text-gray-400">{previewResult.counts.tasks.duplicates} duplicates skipped</span>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="text-xs text-gray-500">Invoices</span>
              <p className="text-lg font-bold text-gray-900">{previewResult.counts.invoices.prospective}</p>
              <span className="text-[10px] text-gray-400">{previewResult.counts.invoices.duplicates} duplicates skipped</span>
            </div>
          </div>

          {previewResult.unsupportedFields.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
              <strong>Unsupported fields detected (will be omitted safely):</strong>
              <ul className="list-disc ml-4 mt-1">
                {previewResult.unsupportedFields.slice(0, 5).map((u, i) => (
                  <li key={i}>{u.entity} [{u.legacyId}]: {u.fields.join(", ")}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleConfirmImport}
              disabled={isLoading}
              className="px-5 py-2.5 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 shadow"
            >
              {isLoading ? "Importing Data..." : "Confirm & Execute Migration"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Execution Success Report */}
      {executionResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <h3 className="text-sm font-bold text-green-900">Migration Successfully Executed!</h3>
          </div>
          <p className="text-xs text-green-800">
            Batch ID: <code className="font-mono">{executionResult.batchId}</code>
          </p>
          <div className="text-xs text-green-700">
            Imported: {executionResult.counts.clients.prospective} Clients, {executionResult.counts.matters.prospective} Matters, {executionResult.counts.tasks.prospective} Tasks.
          </div>
        </div>
      )}
    </div>
  );
}
