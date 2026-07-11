import { z } from "zod";
import { CRMRecordSchema } from "./apps/backend/src/utils/zodSchemas";

const testData = [
  {
    "email": "not-an-email",
  },
  {
    "email": "",
  },
  {
    "crm_status": "GOOD_LEAD_FOLLOW_UP"
  }
];

testData.forEach((data, idx) => {
  const result = CRMRecordSchema.safeParse(data);
  console.log(`Row ${idx}:`, result.success ? "Success" : JSON.stringify(result.error.issues, null, 2));
});
