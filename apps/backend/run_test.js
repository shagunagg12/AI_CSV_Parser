"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const papaparse_1 = __importDefault(require("papaparse"));
const uuid_1 = require("uuid");
const importService_1 = require("./src/services/importService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const run = async () => {
    const csvString = fs_1.default.readFileSync("../../test_leads_messy.csv", "utf-8");
    const results = papaparse_1.default.parse(csvString, {
        header: true,
        skipEmptyLines: true,
    });
    const rows = results.data;
    console.log("Total rows:", rows.length);
    const jobId = (0, uuid_1.v4)();
    (0, importService_1.createJob)(jobId, rows.length);
    await (0, importService_1.processCSV)(jobId, rows);
    console.log("FINAL RESULTS:", JSON.stringify((0, importService_1.getJobResults)(jobId), null, 2));
};
run().catch(console.error);
//# sourceMappingURL=run_test.js.map