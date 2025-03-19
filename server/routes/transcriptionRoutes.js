const express = require('express');
const { body } = require('express-validator');
const TranscriptionController = require('../controllers/transcriptionController');
const upload = require('../middleware/fileUpload');

const router = express.Router();

// File upload transcription route
router.post('/file', 
  upload.single('audio'),
  [
    body('language')
      .optional()
      .isString()
      .isLength({ min: 2, max: 5 })
      .withMessage('Invalid language code')
  ],
  TranscriptionController.transcribeFile
);

// Live recording transcription route
router.post('/live', 
  upload.single('audio'),
  [
    body('duration')
      .optional()
      .isInt({ min: 1, max: 300 })
      .withMessage('Invalid recording duration')
  ],
  TranscriptionController.transcribeLiveRecording
);

module.exports = router;
