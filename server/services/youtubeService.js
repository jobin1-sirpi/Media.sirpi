const ytdl = require('ytdl-core');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');

class YouTubeService {
  /**
   * Download audio from YouTube video
   * @param {string} videoUrl - YouTube video URL
   * @returns {Promise<string>} Path to downloaded audio file
   */
  static async downloadAudio(videoUrl) {
    return new Promise((resolve, reject) => {
      // Validate YouTube URL
      if (!ytdl.validateURL(videoUrl)) {
        return reject(new Error('Invalid YouTube URL'));
      }

      // Generate temporary file path
      const tempAudioPath = path.join(
        os.tmpdir(), 
        `youtube_audio_${Date.now()}.mp3`
      );

      // Validate video info and length
      ytdl.getInfo(videoUrl)
        .then(info => {
          // Check video length
          const lengthSeconds = parseInt(info.videoDetails.lengthSeconds);
          if (lengthSeconds > 3600) { // Max 1 hour
            return reject(new Error('Video too long. Max 1 hour allowed.'));
          }

          // Download and convert to audio
          const audioStream = ytdl(videoUrl, {
            quality: 'highestaudio',
            filter: 'audioonly'
          });

          // Use FFmpeg to convert to MP3
          ffmpeg(audioStream)
            .toFormat('mp3')
            .audioFrequency(16000) // Whisper prefers 16kHz
            .audioChannels(1)      // Mono channel
            .save(tempAudioPath)
            .on('end', () => resolve(tempAudioPath))
            .on('error', (err) => reject(new Error(`Audio conversion error: ${err.message}`)));
        })
        .catch(error => {
          reject(new Error(`YouTube video info error: ${error.message}`));
        });
    });
  }

  /**
   * Extract video metadata
   * @param {string} videoUrl - YouTube video URL
   * @returns {Promise<Object>} Video metadata
   */
  static async getVideoMetadata(videoUrl) {
    try {
      const info = await ytdl.getInfo(videoUrl);
      return {
        title: info.videoDetails.title,
        lengthSeconds: parseInt(info.videoDetails.lengthSeconds),
        author: info.videoDetails.author.name
      };
    } catch (error) {
      throw new Error(`Failed to fetch video metadata: ${error.message}`);
    }
  }

  /**
   * Validate YouTube URL
   * @param {string} videoUrl - YouTube video URL
   * @returns {boolean} Validity of URL
   */
  static validateYouTubeUrl(videoUrl) {
    return ytdl.validateURL(videoUrl);
  }
}

module.exports = YouTubeService;
