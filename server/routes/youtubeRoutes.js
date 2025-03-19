const express = require('express');
const { body } = require('express-validator');
const YouTubeController = require('../controllers/youtubeController');

const router = express.Router();

// YouTube transcription route
router.post('/transcribe', 
  [
    body('videoUrl')
      .isURL()
      .matches(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/)
      .withMessage('Invalid YouTube URL'),
    body('language')
      .optional()
      .isString()
      .isLength({ min: 2, max: 5 })
      .withMessage('Invalid language code')
  ],
  YouTubeController.transcribeYouTubeVideo
);

module.exports = router;
