"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zodSchemas_1 = require("./src/utils/zodSchemas");
const countryCodeSchema = zodSchemas_1.CRMRecordSchema.shape.country_code;
console.log("country_code outer:", countryCodeSchema.constructor.name);
if (countryCodeSchema._def.innerType) {
    console.log("country_code inner1:", countryCodeSchema._def.innerType.constructor.name);
    if (countryCodeSchema._def.innerType._def.innerType) {
        console.log("country_code inner2:", countryCodeSchema._def.innerType._def.innerType.constructor.name);
    }
}
//# sourceMappingURL=test_inner.js.map