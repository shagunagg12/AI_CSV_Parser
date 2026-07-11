import { z } from "zod";

export const CRMRecordSchema = z.object({
  created_at: z.string().nullish(),
  name: z.string().nullish(),
  email: z.string().email().nullish().or(z.literal("").nullish()),
  country_code: z.string().nullish(),
  mobile_without_country_code: z.string().nullish(),
  company: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  country: z.string().nullish(),
  lead_owner: z.string().nullish(),
  crm_status: z.enum(["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"]).nullish().or(z.literal("").nullish()),
  crm_note: z.string().nullish(),
  data_source: z.enum(["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"]).nullish().or(z.literal("").nullish()),
  possession_time: z.string().nullish(),
  description: z.string().nullish(),
});

console.log("null:", JSON.stringify(CRMRecordSchema.safeParse({ country_code: null }), null, 2));
console.log("undefined:", JSON.stringify(CRMRecordSchema.safeParse({ country_code: undefined }), null, 2));
console.log("empty string:", JSON.stringify(CRMRecordSchema.safeParse({ country_code: "" }), null, 2));
