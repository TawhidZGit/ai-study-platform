const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only PDFs and text files
const fileFilter = (req, file, cb) => {
  // Regex to check for .pdf or .txt extensions (case-insensitive)
  const allowedExts = /^\.(pdf|txt)$/i;
  // Regex to check for application/pdf or text/plain mimetypes
  const allowedMimes = /^(application\/pdf|text\/plain)$/i;

  const extMatches = allowedExts.test(path.extname(file.originalname));
  const mimeMatches = allowedMimes.test(file.mimetype);

  if (extMatches && mimeMatches) {
    // Both extension and mimetype are good
    cb(null, true);
  } else {
    // One of them failed
    cb(new Error('Only PDF and TXT files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

module.exports = upload;
