import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import OpenAI from 'openai'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = formidable()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err)
      return res.status(500).json({ error: 'Error parsing form data' })
    }

    const file = files.file?.[0]
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log('File details:', {
      name: file.originalFilename,
      type: file.mimetype,
      size: file.size,
      path: file.filepath
    })

    try {
      const fileStream = fs.createReadStream(file.filepath)

      const response = await openai.audio.transcriptions.create({
        file: fileStream,
        model: "whisper-1",
        response_format: "text"
      })

      console.log('Transcription response:', response)

      res.status(200).json({ transcription: response })
    } catch (error: any) {
      console.error('Transcription error:', error)
      res.status(500).json({ error: error.message || 'Transcription failed' })
    } finally {
      // Clean up the temporary file
      fs.unlinkSync(file.filepath)
    }
  })
}
