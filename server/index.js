import express from "express";
import cors from "cors";
import multer from "multer";
import { UTApi } from "uploadthing/server";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3001;

// Initialize UTApi with token from environment
const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

// CORS configuration - adjust origins as needed
// Remove trailing slash from CLIENT_URL if present
const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, '') || "*";

app.use(cors({
  origin: clientUrl,
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
}));

app.use(express.json());

// Health check endpoint (for cronjob to keep server alive)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "Family Tree Image Upload Server", 
    endpoints: {
      health: "GET /health",
      upload: "POST /api/upload",
      delete: "POST /api/delete"
    }
  });
});

// Upload endpoint - accepts single file via multipart/form-data
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`Uploading file: ${file.originalname} (${file.size} bytes)`);

    // Create file object compatible with UTApi
    const utFile = new File([file.buffer], file.originalname, {
      type: file.mimetype,
    });

    // Upload to UploadThing
    const result = await utapi.uploadFiles(utFile);

    // Handle response - UTApi returns either single object or array
    if (result.error) {
      console.error("Upload error:", result.error);
      return res.status(500).json({ 
        error: result.error.message || "Upload failed" 
      });
    }

    const data = result.data;
    console.log(`Upload successful: ${data.key}`);

    // Return url and key (key needed for deletion)
    return res.json({
      url: data.url,
      key: data.key,
      name: data.name,
      size: data.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ 
      error: err.message || "Upload failed" 
    });
  }
});

// Delete endpoint - accepts file key in request body
app.post("/api/delete", async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: "File key is required" });
    }

    console.log(`Deleting file: ${key}`);

    // Delete from UploadThing
    await utapi.deleteFiles(key);

    console.log(`Delete successful: ${key}`);
    
    return res.json({ ok: true, deleted: key });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ 
      error: err.message || "Delete failed" 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`🗑️  Delete endpoint: http://localhost:${PORT}/api/delete`);
});
