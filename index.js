const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const helmet = require("helmet");
const dotenv = require("dotenv");

// Import routes
const materialRoutes = require("./routes/materialRoutes");
const examRoutes = require("./routes/examRoute");
const resultRoutes = require("./routes/resultRoute");
const uploadRoutes = require("./routes/uploadRoute");

// Configure environment
dotenv.config();
connectDB();

const app = express();

// Middleware
// Allow cross-origin resource delivery for images served from /uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve uploaded files statically
const path = require('path');
const uploadDir = path.resolve(process.env.STORAGE_PATH || path.join(__dirname, 'uploads'));
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

// Routes
app.use("/api/materials", materialRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/upload", uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    details: `No endpoint found for ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Multer file upload errors
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field',
      details: `Field '${err.field}' is not expected. Expected field: 'images' or 'file'`
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large',
      details: 'File exceeds maximum size of 50MB'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: 'Too many files',
      details: 'Maximum 10 files allowed per request'
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      details: err.message
    });
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      details: 'Request body contains invalid JSON format'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    details: 'An unexpected error occurred on the server'
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
