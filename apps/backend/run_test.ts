import fs from "fs";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { createJob, processCSV, getJobResults } from "./src/services/importService";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  const csvString = fs.readFileSync("../../test_leads_messy.csv", "utf-8");
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });
  
  const rows = results.data as Record<string, string>[];
  console.log("Total rows:", rows.length);
  
  const jobId = uuidv4();
  createJob(jobId, rows.length);
  
  await processCSV(jobId, rows);
  
  console.log("FINAL RESULTS:", JSON.stringify(getJobResults(jobId), null, 2));
};

run().catch(console.error);
