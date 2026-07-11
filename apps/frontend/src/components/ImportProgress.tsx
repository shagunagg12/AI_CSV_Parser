"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ImportProgressProps {
  jobId: string;
  onComplete: () => void;
}

export default function ImportProgress({ jobId, onComplete }: ImportProgressProps) {
  const [status, setStatus] = useState<"processing" | "completed" | "error">("processing");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    imported: 0,
    skipped: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/api/import/progress/${jobId}`);

    sse.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setStats({
        total: data.totalRecords || 0,
        processed: data.processedRecords || 0,
        imported: data.importedRecords?.length || 0,
        skipped: data.skippedRecords?.length || 0,
      });

      if (data.totalRecords) {
        setProgress(Math.round(((data.processedRecords || 0) / data.totalRecords) * 100));
      }

      if (data.status === "completed" || data.status === "error") {
        setStatus(data.status);
        if (data.error) setError(data.error);
        sse.close();
        if (data.status === "completed") {
          onComplete();
        }
      }
    };

    sse.onerror = (err) => {
      console.error("SSE Error:", err);
      setStatus("error");
      setError("Lost connection to server");
      sse.close();
    };

    return () => {
      sse.close();
    };
  }, [jobId]);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {status === "processing" && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
          {status === "completed" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          {status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
          {status === "processing" ? "Importing Data..." : status === "completed" ? "Import Completed!" : "Import Failed"}
        </h3>
        <span className="text-sm font-medium text-gray-500">{progress}%</span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Rows" value={stats.total} />
        <StatCard label="Processed" value={stats.processed} />
        <StatCard label="Successfully Imported" value={stats.imported} color="text-green-600 dark:text-green-400" />
        <StatCard label="Skipped" value={stats.skipped} color="text-yellow-600 dark:text-yellow-400" />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color = "text-gray-900 dark:text-white" }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</div>
    </div>
  );
}
