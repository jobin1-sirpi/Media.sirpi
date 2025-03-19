const multer = require('multer');
const path = require('path');
const os = require('os');

// Configure file storage and naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use system temporary directory
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `transcribe-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for audio types
const audioFileFilter = (req, file, cb) => {
  // Allowed audio mime types
  const allowedTypes = [
    'audio/mpeg',   // MP3
    'audio/wav',    // WAV
    'audio/webm',   // WebM
    'audio/ogg',    // OGG
    'audio/mp4',    // MP4 Audio
    'audio/x-m4a',  // M4A
    'audio/aac'     // AAC
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only audio files are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: audioFileFilter,
  limits: {
    // 50MB file size limit
    fileSize: 50 * 1024 * 1024
  }
});

module.exports = upload;
