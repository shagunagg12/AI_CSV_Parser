"use client";

import { useState } from "react";
import DragDropZone from "@/components/DragDropZone";
import PreviewTable from "@/components/PreviewTable";
import ImportProgress from "@/components/ImportProgress";
import ResultTable from "@/components/ResultTable";

export default function Home() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<Record<string, string>[] | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [finalResults, setFinalResults] = useState<{ imported: any[], skipped: any[] } | null>(null);

  const handleFileParsed = (file: File, data: Record<string, string>[]) => {
    setCsvFile(file);
    setCsvData(data);
  };

  const handleConfirm = async () => {
    if (!csvFile) return;
    
    setIsStarting(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const res = await fetch("http://localhost:5000/api/import/start", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok && data.jobId) {
        setJobId(data.jobId);
      } else {
        setErrorMessage(`Failed to start import: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setErrorMessage("Backend server is unreachable. Please ensure the backend is running on port 5000.");
      } else {
        setErrorMessage(err?.message || "An unexpected error occurred while connecting to the server.");
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleJobComplete = async () => {
    if (!jobId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/import/results/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setFinalResults(data);
      }
    } catch (err) {
      console.error("Failed to fetch results:", err);
    }
  };

  const reset = () => {
    setCsvFile(null);
    setCsvData(null);
    setJobId(null);
    setFinalResults(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            AI-Powered CSV Importer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Intelligently map, clean, and import your messy CSV files into our CRM using Gemini AI.
          </p>
        </header>

        <main className="space-y-8 mt-12">
          {!csvData && !jobId && (
            <DragDropZone onFileParsed={handleFileParsed} />
          )}

          {csvData && !jobId && (
            <div className="space-y-6 fade-in">
              <PreviewTable data={csvData} />
              
              {errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={reset}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isStarting}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isStarting ? "Starting..." : "Confirm Import"}
                </button>
              </div>
            </div>
          )}

          {jobId && (
            <div className="fade-in space-y-8">
              <ImportProgress jobId={jobId} onComplete={handleJobComplete} />
              
              {finalResults && (
                <ResultTable 
                  imported={finalResults.imported} 
                  skipped={finalResults.skipped} 
                />
              )}

              <div className="text-center">
                <button
                  onClick={reset}
                  className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Import Another File
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
