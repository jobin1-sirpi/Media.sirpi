import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import TranscriptionService from '../services/api';

function LiveRecording({ 
  onTranscriptionStart, 
  onTranscriptionSuccess, 
  onTranscriptionError 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Handle data available
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      onTranscriptionError('Failed to access microphone: ' + error.message);
    }
  };

  const stopRecording = () => {
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop timer
    clearInterval(timerRef.current);
    
    // Create audio blob
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    
    // Stop recording state
    setIsRecording(false);
    
    // Validate recording
    if (audioBlob.size === 0) {
      onTranscriptionError('No audio recorded. Please try again.');
      return;
    }
    
    // Start transcription
    onTranscriptionStart();
    
    try {
      // Call transcription service
      TranscriptionService.transcribeLiveRecording(audioBlob)
        .then(onTranscriptionSuccess)
        .catch(onTranscriptionError);
    } catch (error) {
      onTranscriptionError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full bg-gray-100 rounded-lg p-4 text-center">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="
              flex items-center justify-center w-full 
              bg-blue-500 text-white py-3 rounded-lg 
              hover:bg-blue-600 transition-colors
            "
          >
            <FaMicrophone className="mr-2" />
            Start Recording
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-4">
              <FaMicrophone className="text-red-500 mr-2 animate-pulse" />
              <span className="text-gray-700">
                Recording: {recordingTime} seconds
              </span>
            </div>
            <button 
              onClick={stopRecording}
              className="
                flex items-center justify-center w-full 
                bg-red-500 text-white py-3 rounded-lg 
                hover:bg-red-600 transition-colors
              "
            >
              <FaStop className="mr-2" />
              Stop Recording
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Max recording time: 5 minutes
      </p>
    </div>
  );
}

export default LiveRecording;
