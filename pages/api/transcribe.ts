import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import OpenAI from 'openai'
import path from 'path'
import mime from 'mime-types'

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

    const supportedFormats = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm']
    const fileExtension = path.extname(file.originalFilename || '').slice(1).toLowerCase()
    const mimeType = file.mimetype || mime.lookup(file.originalFilename || '') || ''

    console.log('File format details:', {
      fileExtension,
      mimeType,
      supportedExtension: supportedFormats.includes(fileExtension),
      supportedMimeType: mimeType.split('/')[0] === 'audio' || mimeType.split('/')[1] === 'webm'
    })

    if (!supportedFormats.includes(fileExtension) && !(mimeType.split('/')[0] === 'audio' || mimeType.split('/')[1] === 'webm')) {
      console.error('Unsupported file format:', { fileExtension, mimeType })
      return res.status(400).json({ error: 'Unsupported file format' })
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath)
      console.log('File buffer:', fileBuffer.length, 'bytes')
      console.log('File buffer (first 100 bytes):', fileBuffer.slice(0, 100))

      const response = await openai.audio.transcriptions.create({
        file: new File([fileBuffer], file.originalFilename || 'audio.mp3', { type: file.mimetype }),
        model: "whisper-1",
      })

      console.log('Transcription response:', response)

      res.status(200).json({ transcription: response.text })
    } catch (error: any) {
      console.error('Transcription error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      res.status(500).json({ error: error.message || 'Transcription failed' })
    } finally {
      // Clean up the temporary file
      fs.unlinkSync(file.filepath)
    }
  })
}
