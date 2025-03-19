import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';
import TranscriptionService from '../services/api';

function FileUpload({ 
  onTranscriptionStart, 
  onTranscriptionSuccess, 
  onTranscriptionError 
}) {
  const onDrop = useCallback(async (acceptedFiles) => {
    // Validate file
    const file = acceptedFiles[0];
    if (!file) {
      onTranscriptionError('Invalid file. Please upload an audio file.');
      return;
    }

    // Validate file type and size
    const allowedTypes = [
      'audio/mpeg',   // MP3
      'audio/wav',    // WAV
      'audio/webm',   // WebM
      'audio/ogg',    // OGG
      'audio/mp4',    // MP4 Audio
      'audio/x-m4a'   // M4A
    ];

    if (!allowedTypes.includes(file.type)) {
      onTranscriptionError('Unsupported file type. Please upload an audio file.');
      return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      onTranscriptionError('File too large. Maximum file size is 50MB.');
      return;
    }

    // Start transcription process
    onTranscriptionStart();

    try {
      // Call transcription service
      const result = await TranscriptionService.transcribeFile(file);
      onTranscriptionSuccess(result);
    } catch (error) {
      onTranscriptionError(error.message);
    }
  }, [onTranscriptionStart, onTranscriptionSuccess, onTranscriptionError]);

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive 
  } = useDropzone({ 
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.webm', '.ogg', '.m4a']
    },
    multiple: false 
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
        transition-colors duration-300 
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-500'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center">
        <FaCloudUploadAlt 
          className={`
            text-6xl mb-4 
            ${isDragActive ? 'text-blue-500' : 'text-gray-400'}
          `} 
        />
        <p className="text-gray-600 mb-2">
          {isDragActive 
            ? 'Drop your audio file here' 
            : 'Drag and drop an audio file, or click to select'
          }
        </p>
        <em className="text-xs text-gray-500">
          Supports MP3, WAV, WebM, OGG, M4A (Max 50MB)
        </em>
      </div>
    </div>
  );
}

export default FileUpload;
