'use client'

import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

// Initialize Groq client with API key from environment variable
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert audio to base64
    const base64Audio = buffer.toString('base64')

    // Assuming Groq has a transcribe method. This is hypothetical and needs to be adjusted based on actual Groq API.
    const response = await groq.transcribe({
      audio: base64Audio,
      model: 'whisper-1', // Adjust based on available Groq models
      language: 'en'
    })

    const transcription = response.text

    return NextResponse.json({ transcription })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}

export function RouteTs() {
  // Component logic...
  return <div>Transcription Component</div>
}

// If you're using default export, change it to named export
// export default RouteTs;

// Alternatively, you can keep the default export and add a named export
// export { RouteTs };

// Rest of the file...
