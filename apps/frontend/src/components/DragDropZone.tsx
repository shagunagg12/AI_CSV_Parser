"use client";

import React, { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DragDropZoneProps {
  onFileParsed: (file: File, data: Record<string, string>[]) => void;
}

export default function DragDropZone({ onFileParsed }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("Please upload a valid CSV file.");
      return;
    }
    
    setIsParsing(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false);
        onFileParsed(file, results.data);
      },
      error: (error) => {
        setIsParsing(false);
        alert(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl cursor-pointer transition-colors w-full max-w-3xl mx-auto",
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-gray-800"
      )}
    >
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileInputChange}
      />
      <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        {isParsing ? "Parsing CSV..." : "Click or drag CSV file here"}
      </h3>
      <p className="text-gray-500 text-sm">
        Supports any valid CSV structure. Max file size: 50MB.
      </p>
    </div>
  );
}
