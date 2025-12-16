const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get storage path from environment variable
const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, '../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`[Multer] Saving file to: ${STORAGE_PATH}`);
    cb(null, STORAGE_PATH);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const finalName = name + '_' + uniqueSuffix + ext;
    console.log(`[Multer] Generated filename: ${finalName}`);
    cb(null, finalName);
  }
});

// File filter - allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];

  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'doc', 'docx', 'xls', 'xlsx'];

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.originalname} (${file.mimetype}). Allowed: PDF, JPG, PNG, GIF, TXT, DOC, DOCX, XLS, XLSX`
      ),
      false
    );
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Middleware to handle single file upload
const uploadSingleFile = upload.single('file');

// Middleware to handle images field (for frontend compatibility)
const uploadImages = upload.single('images');

// Middleware to handle multiple file uploads
const uploadMultipleFiles = upload.array('files', 5); // Max 5 files

// Middleware to handle multiple images field
const uploadMultipleImages = upload.array('images', 10); // Max 10 images

// Helper function to delete file
const deleteFile = (filename) => {
  try {
    const filePath = path.join(STORAGE_PATH, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error deleting file:', err);
    return false;
  }
};

// Helper function to get file path
const getFilePath = (filename) => {
  return path.join(STORAGE_PATH, filename);
};

module.exports = {
  uploadSingleFile,
  uploadImages,
  uploadMultipleFiles,
  uploadMultipleImages,
  deleteFile,
  getFilePath,
  STORAGE_PATH
};
