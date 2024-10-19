'use client'

import React, { useState } from 'react'
import { FiUpload, FiFileText } from 'react-icons/fi'

export function RouteTs() {
  const [file, setFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Transcription failed')
      }

      const data = await response.json()
      setTranscription(data.transcription)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
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
                <FiUpload className="w-10 h-10 mb-3 text-indigo-500" />
                <p className="mb-2 text-sm text-indigo-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-indigo-500">MP3, WAV, or M4A (MAX. 10MB)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="audio/*" />
            </label>
          </div>
          {file && (
            <p className="text-sm text-indigo-600 text-center">
              Selected file: {file.name}
            </p>
          )}
          <button
            type="submit"
            disabled={!file || isLoading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition duration-300 ${
              !file || isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Transcribing...' : 'Transcribe'}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        {transcription && (
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center">
              <FiFileText className="mr-2" /> Transcription
            </h2>
            <p className="text-indigo-900 whitespace-pre-wrap">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  )
}
