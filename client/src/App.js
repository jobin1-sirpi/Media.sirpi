import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import LiveRecording from './components/LiveRecording';
import YouTubeTranscription from './components/YoutubeTranscription';
import TranscriptionOutput from './components/TranscriptionOutput';

function App() {
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('file');

  const handleTranscriptionSuccess = (result) => {
    setTranscription(result);
    setError(null);
  };

  const handleTranscriptionError = (errorMessage) => {
    setError(errorMessage);
    setTranscription(null);
  };

  const renderTranscriptionMethod = () => {
    switch (activeTab) {
      case 'file':
        return (
          <FileUpload 
            onTranscriptionStart={() => setIsLoading(true)}
            onTranscriptionSuccess={(result) => {
              setIsLoading(false);
              handleTranscriptionSuccess(result);
            }}
            onTranscriptionError={(err) => {
              setIsLoading(false);
              handleTranscriptionError(err);
            }}
          />
        );
      case 'youtube':
        return (
          <YouTubeTranscription 
            onTranscriptionStart={() => setIsLoading(true)}
            onTranscriptionSuccess={(result) => {
              setIsLoading(false);
              handleTranscriptionSuccess(result);
            }}
            onTranscriptionError={(err) => {
              setIsLoading(false);
              handleTranscriptionError(err);
            }}
          />
        );
      case 'live':
        return (
          <LiveRecording 
            onTranscriptionStart={() => setIsLoading(true)}
            onTranscriptionSuccess={(result) => {
              setIsLoading(false);
              handleTranscriptionSuccess(result);
            }}
            onTranscriptionError={(err) => {
              setIsLoading(false);
              handleTranscriptionError(err);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Speech-to-Text Transcription
        </h1>

        {/* Tabs */}
        <div className="flex mb-4 border-b">
          {['file', 'youtube', 'live'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} Transcription
            </button>
          ))}
        </div>

        {/* Transcription Method Component */}
        {renderTranscriptionMethod()}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Transcribing...</span>
          </div>
        )}

        {/* Error Handling */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Transcription Output */}
        {transcription && !isLoading && (
          <TranscriptionOutput 
            transcription={transcription} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
