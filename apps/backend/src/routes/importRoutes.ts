import { Router } from "express";
import multer from "multer";
import { startImport, streamProgress, getResults } from "../controllers/importController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/start", upload.single("file"), startImport);
router.get("/progress/:jobId", streamProgress);
router.get("/results/:jobId", getResults);

export default router;
