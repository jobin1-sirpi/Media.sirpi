const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class WhisperService {
  /**
   * Transcribe audio file using Whisper
   * @param {string} audioFilePath - Path to the audio file
   * @returns {Promise<Object>} Transcription result
   */
  static async transcribeAudio(audioFilePath) {
    return new Promise((resolve, reject) => {
      // Temporary output directory
      const outputDir = os.tmpdir();

      // Whisper transcription command
      const whisperProcess = spawn('whisper', [
        audioFilePath,
        '--model', process.env.WHISPER_MODEL || 'base',
        '--output_dir', outputDir,
        '--output_format', 'json',
        '--language', 'auto'
      ]);

      let errorOutput = '';
      let transcriptionOutput = '';

      // Capture output
      whisperProcess.stdout.on('data', (data) => {
        transcriptionOutput += data.toString();
      });

      // Capture error output
      whisperProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // Handle process completion
      whisperProcess.on('close', async (code) => {
        if (code !== 0) {
          return reject(new Error(`Whisper transcription failed: ${errorOutput}`));
        }

        try {
          // Find the JSON output file
          const outputFiles = await fs.readdir(outputDir);
          const jsonOutputFile = outputFiles.find(
            file => path.extname(file) === '.json' && 
                    file.includes(path.basename(audioFilePath, path.extname(audioFilePath)))
          );

          if (!jsonOutputFile) {
            throw new Error('No transcription output found');
          }

          // Read transcription JSON
          const transcriptionPath = path.join(outputDir, jsonOutputFile);
          const transcriptionData = JSON.parse(
            await fs.readFile(transcriptionPath, 'utf8')
          );

          // Clean up output files
          await Promise.all([
            fs.unlink(transcriptionPath),
            fs.unlink(audioFilePath)
          ]);

          // Resolve with transcription details
          resolve({
            text: transcriptionData.text.trim(),
            segments: transcriptionData.segments,
            language: transcriptionData.language,
            confidence: this.computeConfidence(transcriptionData)
          });
        } catch (readError) {
          reject(readError);
        }
      });
    });
  }

  /**
   * Compute transcription confidence
   * @param {Object} transcriptionData - Whisper transcription output
   * @returns {number} Confidence score
   */
  static computeConfidence(transcriptionData) {
    // Calculate confidence base
static computeConfidence(transcriptionData) {
    // If no segments, return low confidence
    if (!transcriptionData.segments || transcriptionData.segments.length === 0) {
      return 0.5;
    }

    // Calculate average confidence from segments
    const confidenceScores = transcriptionData.segments.map(segment => {
      // Use average probability as a confidence indicator
      const avgProbability = segment.words 
        ? segment.words.reduce((sum, word) => sum + (word.probability || 0), 0) / segment.words.length
        : 0.7; // Default confidence

      return avgProbability;
    });

    // Calculate overall confidence
    const averageConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;

    // Normalize to 0-1 scale, with a minimum of 0.5
    return Math.max(0.5, Math.min(1, averageConfidence));
  }

  /**
   * Detect language of transcribed text
   * @param {Object} transcriptionData - Whisper transcription output
   * @returns {string} Detected language code
   */
  static detectLanguage(transcriptionData) {
    // Use Whisper's detected language
    return transcriptionData.language || 'unknown';
  }
}

module.exports = WhisperService;
