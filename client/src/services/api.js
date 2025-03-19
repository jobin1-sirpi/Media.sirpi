import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8920/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// API service with transcription methods
const TranscriptionService = {
  /**
   * Transcribe file upload
   * @param {File} file - Audio file to transcribe
   * @param {Object} options - Additional transcription options
   * @returns {Promise} Transcription result
   */
  async transcribeFile(file, options = {}) {
    const formData = new FormData();
    formData.append('audio', file);

    // Add optional parameters
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    try {
      const response = await apiClient.post('/transcribe/file', formData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  },

  /**
   * Transcribe YouTube video
   * @param {string} videoUrl - YouTube video URL
   * @param {Object} options - Additional transcription options
   * @returns {Promise} Transcription result
   */
  async transcribeYouTube(videoUrl, options = {}) {
    try {
      const response = await apiClient.post('/youtube/transcribe', {
        videoUrl,
        ...options
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  },

  /**
   * Transcribe live recording
   * @param {Blob} audioBlob - Audio blob from live recording
   * @param {Object} options - Additional transcription options
   * @returns {Promise} Transcription result
   */
  async transcribeLiveRecording(audioBlob, options = {}) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    // Add optional parameters
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    try {
      const response = await apiClient.post('/transcribe/live', formData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  },

  /**
   * Handle API errors
   * @param {Error} error - Axios error object
   * @throws {Error} Processed error
   */
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      const errorMessage = error.response.data.message || 'Transcription failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      throw new Error('Error preparing transcription request.');
    }
  }
};

export default TranscriptionService;
