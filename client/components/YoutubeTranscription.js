import React, { useState } from 'react';
import { FaYoutube } from 'react-icons/fa';
import TranscriptionService from '../services/api';

function YouTubeTranscription({ 
  onTranscriptionStart, 
  onTranscriptionSuccess, 
  onTranscriptionError 
}) {
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic URL validation
    const youtubeUrlRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeUrlRegex.test(videoUrl)) {
      onTranscriptionError('Invalid YouTube URL. Please enter a valid YouTube video link.');
      return;
    }

    // Start transcription process
    onTranscriptionStart();

    try {
      // Call transcription service
      const result = await TranscriptionService.transcribeYouTube(videoUrl);
      onTranscriptionSuccess(result);
    } catch (error) {
      onTranscriptionError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center border rounded-lg overflow-hidden">
        <div className="p-3 bg-gray-100 border-r">
          <FaYoutube className="text-red-600 text-2xl" />
        </div>
        <input 
          type="text" 
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
          className="w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="
          w-full bg-blue-500 text-white py-3 rounded-lg 
          hover:bg-blue-600 transition-colors
          flex items-center justify-center
        "
      >
        <FaYoutube className="mr-2" />
        Transcribe YouTube Video
      </button>

      <div className="text-xs text-gray-500 text-center"
      >
        Supports YouTube videos up to 1 hour long
      </div>
    </form>
  );
}

export default YouTubeTranscription;
