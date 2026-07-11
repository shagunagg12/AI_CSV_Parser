import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";
import { createJob, processCSV, subscribeClient, getJobResults } from "../services/importService";

export const startImport = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const csvString = req.file.buffer.toString('utf-8');
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        
        if (rows.length === 0) {
          return res.status(400).json({ error: "Empty CSV file." });
        }

        const jobId = uuidv4();
        createJob(jobId, rows.length);

        // Start processing in the background
        processCSV(jobId, rows);

        res.status(200).json({ jobId });
      },
      error: (error: any) => {
        res.status(400).json({ error: `Error parsing CSV: ${error.message}` });
      }
    });
  } catch (error) {
    console.error("Error starting import:", error);
    res.status(500).json({ error: "Failed to start import job." });
  }
};

export const streamProgress = (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  if (!jobId) {
    return res.status(400).json({ error: "Missing jobId parameter" });
  }

  // Subscribes the response object to SSE updates
  subscribeClient(jobId, res);
  
  req.on('close', () => {
    // Client disconnected, handled in subscribeClient if needed, but we rely on simple end for now
    console.log(`Client disconnected from job ${jobId}`);
  });
};

export const getResults = (req: Request, res: Response) => {
  const { jobId } = req.params;
  if (!jobId) {
    return res.status(400).json({ error: "Missing jobId parameter" });
  }

  const results = getJobResults(jobId);
  if (!results) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.status(200).json(results);
};
