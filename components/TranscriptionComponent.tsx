'use client'

import React, { useState } from 'react'
import { RouteTs } from "./app-api-transcribe-route"
import { TranscriptionSegment } from './TranscriptionSegment';
// Removed incorrect import of TranscriptionSegment

interface Segment {
  text: string;
  start: number;
  end: number;
}

export function TranscriptionComponent() {
  const [transcription, setTranscription] = useState<string | Segment[]>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTranscriptionComplete = (result: string | Segment[]) => {
    console.log("Transcription received in component:", JSON.stringify(result, null, 2));
    setTranscription(result);
    setIsLoading(false);
  }

  const renderTranscription = () => {
    console.log("Rendering transcription, type:", typeof transcription);
    if (typeof transcription === 'string') {
      return (
        <div className="whitespace-pre-wrap">
          {transcription.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      );
    } else if (Array.isArray(transcription)) {
      console.log("Transcription is an array with length:", transcription.length);
      return (
        <div className="space-y-2">
          {transcription.map((segment, index) => (
            <TranscriptionSegment key={index} segment={segment} />
          ))}
        </div>
      );
    }
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <RouteTs onTranscriptionComplete={handleTranscriptionComplete} setIsLoading={setIsLoading} />
      {isLoading && <p className="mt-4 text-gray-600">Transcribing audio...</p>}
      {transcription && !isLoading && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Transcription Result:</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            {renderTranscription()}
          </div>
        </div>
      )}
      {!transcription && !isLoading && <p className="mt-4 text-gray-600">No transcription available yet.</p>}
    </div>
  )
}
