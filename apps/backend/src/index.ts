import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import importRoutes from "./routes/importRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Increase payload limit for large JSON arrays
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/import", importRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
