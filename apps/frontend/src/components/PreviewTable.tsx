"use client";

import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface PreviewTableProps {
  data: Record<string, string>[];
}

export default function PreviewTable({ data }: PreviewTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  if (data.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold">CSV Preview</h3>
        <p className="text-sm text-gray-500">{data.length.toLocaleString()} rows found</p>
      </div>

      <div
        ref={parentRef}
        className="w-full overflow-auto"
        style={{ height: "400px" }}
      >
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700 shadow-sm">
            <tr>
              <th className="p-3 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 w-16 text-center">
                #
              </th>
              {headers.map((header) => (
                <th
                  key={header}
                  className="p-3 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  {header}
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
              const row = data[virtualRow.index];
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
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="p-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                      title={row[header]}
                    >
                      {row[header]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
