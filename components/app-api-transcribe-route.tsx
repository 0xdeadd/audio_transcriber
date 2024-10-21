'use client'

import React, { useState } from 'react'
import { FiUpload, FiFileText } from 'react-icons/fi'

interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
}

interface RouteTsProps {
  onTranscriptionComplete: (result: string | TranscriptionSegment[]) => void
  setIsLoading: (loading: boolean) => void
  isLoading: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function RouteTs({ onTranscriptionComplete, setIsLoading, isLoading }: RouteTsProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [includeTimestamps, setIncludeTimestamps] = useState(false)
  const [timestampInterval, setTimestampInterval] = useState(5)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`File size exceeds the limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        return;
      }
      setFile(selectedFile);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return

    console.log("Submitting with includeTimestamps:", includeTimestamps);

    setIsLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('includeTimestamps', includeTimestamps.toString())
    formData.append('timestampInterval', timestampInterval.toString())

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Transcription result:", result.transcription);
        onTranscriptionComplete(result.transcription)
      } else {
        const errorData = await response.json()
        setError(`Transcription failed: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error during transcription:', error)
      setError('An error occurred during transcription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">Audio Transcription</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-indigo-300 border-dashed rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition duration-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUpload className="w-10 h-10 mb-3 text-indigo-500" aria-hidden="true" />
                <p className="mb-2 text-sm text-indigo-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-indigo-500">MP3, WAV, or M4A (MAX. 10MB)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="audio/*" aria-label="Upload audio file" />
            </label>
          </div>
          {file && (
            <p className="text-sm text-indigo-600 text-center">
              Selected file: {file.name}
            </p>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeTimestamps"
              checked={includeTimestamps}
              onChange={(e) => setIncludeTimestamps(e.target.checked)}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <label htmlFor="includeTimestamps" className="text-sm text-indigo-700">Include timestamps</label>
          </div>
          {includeTimestamps && (
            <div className="flex items-center space-x-2">
              <label htmlFor="timestampInterval" className="text-sm text-indigo-700">Timestamp interval (seconds):</label>
              <input
                type="number"
                id="timestampInterval"
                value={timestampInterval}
                onChange={(e) => setTimestampInterval(Number(e.target.value))}
                min="1"
                max="60"
                className="form-input w-16 px-2 py-1 text-sm border-indigo-300 rounded"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={!file || isLoading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition duration-300 ${
              !file || isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            aria-live="polite"
          >
            {isLoading ? 'Transcribing...' : 'Transcribe'}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  )
}
