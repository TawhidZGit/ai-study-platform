const multer = require('multer');
const path = require('path');

// Configure storage to use RAM (Memory) instead of the hard drive
const storage = multer.memoryStorage();

// File filter - only PDFs and text files
const fileFilter = (req, file, cb) => {
  const allowedExts = /^\.(pdf|txt)$/i;
  const allowedMimes = /^(application\/pdf|text\/plain)$/i;

  const extMatches = allowedExts.test(path.extname(file.originalname));
  const mimeMatches = allowedMimes.test(file.mimetype);

  if (extMatches && mimeMatches) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and TXT files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

module.exports = upload;