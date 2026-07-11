import { CRMRecord, CRMRecordSchema } from "../utils/zodSchemas";
import { mapBatchToCRM } from "./geminiService";

export interface ImportJobState {
  jobId: string;
  totalRecords: number;
  processedRecords: number;
  importedRecords: CRMRecord[];
  skippedRecords: any[];
  failedBatches: Record<string, string>[][];
  status: "processing" | "completed" | "error";
  error?: string;
}

const jobs = new Map<string, ImportJobState>();
const sseClients = new Map<string, any>(); // Response objects for SSE

export const createJob = (jobId: string, totalRecords: number) => {
  jobs.set(jobId, {
    jobId,
    totalRecords,
    processedRecords: 0,
    importedRecords: [],
    skippedRecords: [],
    failedBatches: [],
    status: "processing",
  });
};

export const getJobResults = (jobId: string) => {
  const job = jobs.get(jobId);
  if (!job) return null;
  
  let validationFailures = 0;
  let missingContactInfo = 0;

  job.skippedRecords.forEach(r => {
    if (r.reason && r.reason.includes("Schema validation")) validationFailures++;
    else if (r.reason && r.reason.includes("Missing both email and mobile")) missingContactInfo++;
  });

  return {
    imported: job.importedRecords,
    skipped: job.skippedRecords,
    failedBatches: job.failedBatches,
    totalImported: job.importedRecords.length,
    totalSkipped: job.skippedRecords.length,
    summary: {
      imported: job.importedRecords.length,
      validationFailures,
      aiFailures: job.failedBatches.reduce((acc, b) => acc + b.length, 0),
      missingContactInfo,
    }
  };
};

export const subscribeClient = (jobId: string, res: any) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  sseClients.set(jobId, res);
  
  // Send initial state
  const job = jobs.get(jobId);
  if (job) {
    sendUpdate(jobId, job);
  }
};

const sendUpdate = (jobId: string, data: any) => {
  const client = sseClients.get(jobId);
  if (client) {
    // To save bandwidth, don't send full arrays in progress events
    const payload = {
      ...data,
      importedRecords: { length: data.importedRecords?.length || 0 },
      skippedRecords: { length: data.skippedRecords?.length || 0 },
    };
    client.write(`data: ${JSON.stringify(payload)}\n\n`);
    
    if (data.status === "completed" || data.status === "error") {
      client.end();
      sseClients.delete(jobId);
    }
  }
};

const BATCH_SIZE = 5;

const RETRY_DELAYS = [2000, 5000, 10000, 20000, 30000];

export const processCSV = async (jobId: string, rows: Record<string, string>[]) => {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      
      let retryCount = 0;
      let success = false;
      let mappedRecords: CRMRecord[] = [];
      
      while (!success && retryCount <= RETRY_DELAYS.length) {
        try {
          mappedRecords = await mapBatchToCRM(batch);
          console.log(`[ImportService] Batch ${i / BATCH_SIZE + 1} processed successfully. Input rows: ${batch.length}, Output mapped records: ${mappedRecords.length}`);
          success = true;
        } catch (err: any) {
          const status = err.status || 500;
          const isTemporaryError = [429, 500, 502, 503, 504].includes(status);
          
          if (isTemporaryError && retryCount < RETRY_DELAYS.length) {
            const delay = RETRY_DELAYS[retryCount];
            retryCount++;
            console.error(`[ImportService] Batch ${i / BATCH_SIZE + 1} (size: ${batch.length}) failed (Status: ${status}, Prompt Length: ${err.promptLength || 'unknown'}). Retry ${retryCount}/${RETRY_DELAYS.length} in ${delay}ms`);
            await new Promise(r => setTimeout(r, delay));
          } else {
             // Exhausted retries or non-temporary error
             console.error(`[ImportService] Batch ${i / BATCH_SIZE + 1} failed permanently after ${retryCount} retries. Status: ${status}. Moving to failedBatches.`);
             job.failedBatches.push(batch);
             break;
          }
        }
      }

      if (success) {
        // Validate and apply logic: Skip if neither email nor mobile
        mappedRecords.forEach((record, idx) => {
           const parsed = CRMRecordSchema.safeParse(record);
           const rawRow = batch[idx];
           
           if (!parsed.success) {
              console.error(`[ImportService] Schema validation failed for row:`, JSON.stringify(parsed.error.issues, null, 2));
              console.error(`[ImportService] Raw record:`, JSON.stringify(record, null, 2));
              job.skippedRecords.push({ raw: rawRow, reason: "Schema validation failed", errors: parsed.error.issues });
           } else {
              const data = parsed.data;
              if (!data.email && !data.mobile_without_country_code) {
                  job.skippedRecords.push({ raw: rawRow, reason: "Missing both email and mobile" });
              } else {
                  job.importedRecords.push(data);
              }
           }
        });
      }

      job.processedRecords += batch.length;
      sendUpdate(jobId, { ...job });
    }

    job.status = "completed";
    sendUpdate(jobId, { ...job });

  } catch (error: any) {
    job.status = "error";
    job.error = error.message;
    sendUpdate(jobId, { ...job });
  }
};
