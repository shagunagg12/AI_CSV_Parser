import { CRMRecordSchema } from "./src/utils/zodSchemas";

for (const [key, schema] of Object.entries(CRMRecordSchema.shape)) {
  console.log(`${key}:`, schema.constructor.name);
}
