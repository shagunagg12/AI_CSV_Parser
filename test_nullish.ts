import { z } from "zod";

const testSchema = z.object({
  field1: z.string().nullish(),
  field2: z.string().nullable(),
});

console.log("nullish with null:", JSON.stringify(testSchema.safeParse({ field1: null, field2: null }), null, 2));
console.log("nullish with undefined:", JSON.stringify(testSchema.safeParse({ field1: undefined, field2: undefined }), null, 2));
