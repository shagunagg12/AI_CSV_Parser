import { CRMRecordSchema } from "./src/utils/zodSchemas";

console.log("null:", JSON.stringify(CRMRecordSchema.safeParse({ country_code: null }), null, 2));
