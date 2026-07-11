"use client";

import React, { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface ResultTableProps {
  imported: any[];
  skipped: any[];
}

export default function ResultTable({ imported, skipped }: ResultTableProps) {
  const [activeTab, setActiveTab] = useState<"imported" | "skipped">("imported");
  const parentRef = useRef<HTMLDivElement>(null);

  const displayData = activeTab === "imported" ? imported : skipped;
  
  // For imported, we use the standard CRM schema fields
  const importedHeaders = [
    "name", "email", "mobile_without_country_code", "company", 
    "crm_status", "data_source", "crm_note", "created_at", "city", 
    "state", "country", "lead_owner", "possession_time", "description", "country_code"
  ];
  
  // For skipped, the schema is { raw: {}, reason: string }
  const skippedHeaders = ["reason", "raw_data"];

  const headers = activeTab === "imported" ? importedHeaders : skippedHeaders;

  const rowVirtualizer = useVirtualizer({
    count: displayData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => setActiveTab("imported")}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "imported"
              ? "border-blue-500 text-blue-600 bg-white dark:bg-gray-800 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Successfully Imported ({imported.length})
        </button>
        <button
          onClick={() => setActiveTab("skipped")}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "skipped"
              ? "border-yellow-500 text-yellow-600 bg-white dark:bg-gray-800 dark:text-yellow-400"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Skipped Rows ({skipped.length})
        </button>
      </div>

      <div
        ref={parentRef}
        className="w-full overflow-auto"
        style={{ height: "500px" }}
      >
        {displayData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No records in this category.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700 shadow-sm">
              <tr>
                <th className="p-3 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 w-16 text-center">
                  #
                </th>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="p-3 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap capitalize"
                  >
                    {header.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = displayData[virtualRow.index];
                return (
                  <tr
                    key={virtualRow.index}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 absolute top-0 left-0 w-full"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <td className="p-3 whitespace-nowrap text-gray-500 text-center border-r border-gray-100 dark:border-gray-700">
                      {virtualRow.index + 1}
                    </td>
                    {activeTab === "imported" ? (
                      headers.map((header) => (
                        <td
                          key={header}
                          className="p-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                          title={row[header] || ""}
                        >
                          {row[header] || "-"}
                        </td>
                      ))
                    ) : (
                      <>
                        <td className="p-3 text-red-500 font-medium">
                          {row.reason}
                        </td>
                        <td className="p-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {JSON.stringify(row.raw)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
