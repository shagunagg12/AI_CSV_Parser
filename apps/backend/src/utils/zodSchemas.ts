import { z } from "zod";

export const CRMStatusEnum = z.enum([
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
]);

export const DataSourceEnum = z.enum([
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
]);

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
  crm_status: CRMStatusEnum.nullish().or(z.literal("").nullish()),
  crm_note: z.string().nullish(),
  data_source: DataSourceEnum.nullish().or(z.literal("").nullish()),
  possession_time: z.string().nullish(),
  description: z.string().nullish(),
});

export type CRMRecord = z.infer<typeof CRMRecordSchema>;

export const BatchResultSchema = z.object({
  parsed_records: z.array(CRMRecordSchema),
});
