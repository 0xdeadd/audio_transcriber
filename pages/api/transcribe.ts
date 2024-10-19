import { NextApiRequest, NextApiResponse } from 'next'
import { Groq } from 'groq-sdk'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' })
    }

    const file = files.file as formidable.File
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath)
      const base64Audio = fileBuffer.toString('base64')

      const response = await groq.transcribe({
        audio: base64Audio,
        model: 'whisper-1',
        language: 'en',
      })

      res.status(200).json({ transcription: response.text })
    } catch (error) {
      console.error('Transcription error:', error)
      res.status(500).json({ error: 'Transcription failed' })
    }
  })
}
