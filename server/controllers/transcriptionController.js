const WhisperService = require('../services/whisperService');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

class TranscriptionController {
  /**
   * Transcribe uploaded audio file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async transcribeFile(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get file path
      const filePath = req.file.path;

      // Transcribe file
      const transcription = await WhisperService.transcribeAudio(filePath);

      // Clean up temporary file
      await fs.unlink(filePath);

      // Respond with transcription
      res.json({
        transcription: transcription.text,
        confidence: transcription.confidence,
        language: transcription.language
      });
    } catch (error) {
      console.error('File transcription error:', error);
      res.status(500).json({ 
        error: 'Transcription failed', 
        message: error.message 
      });
    }
  }

  /**
   * Transcribe live audio recording
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async transcribeLiveRecording(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ error: 'No audio data received' });
      }

      // Get file path
      const filePath = req.file.path;

      // Transcribe audio
      const transcription = await WhisperService.transcribeAudio(filePath);

      // Clean up temporary file
      await fs.unlink(filePath);

      // Respond with transcription
      res.json({
        transcription: transcription.text,
        confidence: transcription.confidence,
        language: transcription.language
      });
    } catch (error) {
      console.error('Live recording transcription error:', error);
      res.status(500).json({ 
        error: 'Live recording transcription failed', 
        message: error.message 
      });
    }
  }
}

module.exports = TranscriptionController;
