import { GoogleGenAI } from "@google/genai";
import { CRMRecord } from "../utils/zodSchemas";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "MISSING";
console.log(`[GeminiService] API Key Loaded: ${maskedKey}`);

const ai = new GoogleGenAI({ apiKey });
const MODEL_NAME = "gemini-3.1-flash-lite";
console.log(`[GeminiService] Model: ${MODEL_NAME}`);

const PROMPT = `You are a data mapping assistant. I will provide you with a JSON array of raw CSV rows.
Your task is to map these rows into the following CRM schema and return a JSON object with a single key "parsed_records" containing an array of the mapped objects.

Mapping Rules:
1. Try to map fields to: created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description.
2. If there are multiple emails or phone numbers in a single column/row, keep the first as the primary field, and append the rest into "crm_note". Also dump any other useful unmapped fields (remarks, extra info) into "crm_note".
3. crm_status MUST be strictly one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE. If unclear or missing, leave it blank. Never invent a value.
4. data_source MUST be strictly one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Leave blank if not confidently matched.
5. created_at MUST produce a value valid for \`new Date(created_at)\` in JS.
6. The output must strictly be a valid JSON array of objects. Escape line breaks (\\n) instead of letting them break the JSON structure.
7. Omit any missing or empty fields entirely. Do NOT include null values in the JSON.
8. CRITICAL: You MUST return exactly one mapped object for EVERY row in the input array, in the exact same order. If a row is completely blank, return an empty object {}. Do NOT drop or skip any rows.

Here are the raw rows:
`;

export class GeminiApiError extends Error {
  status: number;
  promptLength: number;
  constructor(message: string, status: number, promptLength: number) {
    super(message);
    this.status = status;
    this.promptLength = promptLength;
  }
}

export const mapBatchToCRM = async (batch: Record<string, string>[]): Promise<CRMRecord[]> => {
  let promptLength = 0;
  try {
    const textPart = PROMPT + JSON.stringify(batch, null, 2);
    promptLength = textPart.length;

    const payload = {
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [{ text: textPart }],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    };

    console.log(`[GeminiService] Request Payload Length: ${promptLength} characters`);
    // Commented out the full payload log to avoid cluttering if it's too large, but leaving it available
    // console.log("[GeminiService] Request Payload:", JSON.stringify(payload, null, 2));

    const response = await ai.models.generateContent(payload);

    // console.log("[GeminiService] Response Data:", JSON.stringify(response, null, 2));

    const text = response.text;
    console.log("[GeminiService] Raw Gemini Response:", text);
    if (!text) throw new Error("Empty response from Gemini");

    const json = JSON.parse(text);
    return json.parsed_records || [];
  } catch (error: any) {
    console.error("[GeminiService] Request Error:", error);
    // @google/genai typically returns error.status (e.g. 503) or error.code
    let status = 500;
    if (error && typeof error === 'object') {
      status = error.status || error.code || 500;
      // Also check inner error structure sometimes used by GCP
      if (error.error && error.error.code) {
        status = error.error.code;
      }
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new GeminiApiError(`Failed to process batch with Gemini: ${message}`, status, promptLength);
  }
};
