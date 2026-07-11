import { CRMRecordSchema } from "./apps/backend/src/utils/zodSchemas";

console.log("null:", JSON.stringify(CRMRecordSchema.safeParse({ country_code: null }), null, 2));
