import { CRMRecordSchema } from "./src/utils/zodSchemas";

const countryCodeSchema = CRMRecordSchema.shape.country_code as any;
console.log("country_code outer:", countryCodeSchema.constructor.name);
if (countryCodeSchema._def.innerType) {
  console.log("country_code inner1:", countryCodeSchema._def.innerType.constructor.name);
  if (countryCodeSchema._def.innerType._def.innerType) {
    console.log("country_code inner2:", countryCodeSchema._def.innerType._def.innerType.constructor.name);
  }
}
