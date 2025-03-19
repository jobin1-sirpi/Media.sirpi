const YouTubeService = require('../services/youtubeService');
const WhisperService = require('../services/whisperService');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;

class YouTubeController {
  /**
   * Transcribe YouTube video
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async transcribeYouTubeVideo(req, res) {
    let audioFilePath = null;

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract YouTube URL
      const { videoUrl } = req.body;
      if (!videoUrl) {
        return res.status(400).json({ error: 'YouTube video URL is required' });
      }

      // Download audio from YouTube
      audioFilePath = await YouTubeService.downloadAudio(videoUrl);

      // Transcribe downloaded audio
      const transcription = await WhisperService.transcribeAudio(audioFilePath);

      // Clean up temporary audio file
      await fs.unlink(audioFilePath);

      // Respond with transcription details
      res.json({
        transcription: transcription.text,
        videoUrl,
        confidence: transcription.confidence,
        language: transcription.language
      });
    } catch (error) {
      console.error('YouTube transcription error:', error);

      // Ensure temporary file is cleaned up in case of error
      if (audioFilePath) {
        try {
          await fs.unlink(audioFilePath);
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary audio file:', cleanupError);
        }
      }

      res.status(500).json({ 
        error: 'YouTube video transcription failed', 
        message: error.message 
      });
    }
  }
}

module.exports = YouTubeController;
