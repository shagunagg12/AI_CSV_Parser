"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zodSchemas_1 = require("./src/utils/zodSchemas");
for (const [key, schema] of Object.entries(zodSchemas_1.CRMRecordSchema.shape)) {
    console.log(`${key}:`, schema.constructor.name);
}
//# sourceMappingURL=test_shape.js.map