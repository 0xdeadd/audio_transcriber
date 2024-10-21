import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import fs from 'fs'
import { OpenAI } from 'openai'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)
const accessPromise = util.promisify(fs.access)

export const config = {
  api: {
    bodyParser: false,
  },
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supportedFormats = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = new IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err)
      return res.status(500).json({ message: 'Error parsing form data' })
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    const includeTimestamps = (Array.isArray(fields.includeTimestamps) ? fields.includeTimestamps[0] : fields.includeTimestamps ?? '') === 'true'
    const timestampInterval = parseInt(fields.timestampInterval?.[0] ?? '') || 5

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const fileExtension = path.extname(file.originalFilename || '').toLowerCase().slice(1)
    if (!supportedFormats.includes(fileExtension)) {
      return res.status(400).json({ message: 'Unsupported file format' })
    }

    try {
      console.log('Processing file:', file.filepath)
      const transcription = await transcribeAudio(file.filepath as string, includeTimestamps, timestampInterval)
      console.log('Transcription result:', JSON.stringify(transcription, null, 2))
      res.status(200).json({ transcription })
    } catch (error) {
      console.error('Transcription error:', error)
      res.status(500).json({ 
        message: 'Error transcribing audio', 
        details: error instanceof Error ? error.message : 'Unknown error',
        filepath: file.filepath,
        stack: error instanceof Error ? error.stack : undefined
      })
    }
  })
}

async function transcribeAudio(filePath: string, includeTimestamps: boolean, timestampInterval: number) {
  if (!filePath) {
    throw new Error('File path is undefined')
  }

  try {
    await accessPromise(filePath, fs.constants.R_OK)
  } catch (error) {
    console.error('File access error:', error)
    throw new Error(`Cannot access file: ${filePath}`)
  }

  const fileExtension = path.extname(filePath).toLowerCase()
  let audioFilePath = filePath

  if (!supportedFormats.includes(fileExtension.slice(1))) {
    // Convert to mp3 if not a supported format
    const outputPath = path.join(path.dirname(filePath), `${path.basename(filePath, fileExtension)}.mp3`)
    try {
      console.log(`Converting file: ${filePath} to ${outputPath}`)
      const { stdout, stderr } = await execPromise(`ffmpeg -i "${filePath}" -acodec libmp3lame "${outputPath}"`)
      console.log('FFmpeg stdout:', stdout)
      console.log('FFmpeg stderr:', stderr)
      audioFilePath = outputPath
    } catch (error) {
      console.error('FFmpeg conversion error:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      throw new Error(`Failed to convert audio file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  let audioFile: fs.ReadStream
  try {
    audioFile = fs.createReadStream(audioFilePath)
  } catch (error) {
    console.error('Error creating read stream:', error)
    throw new Error(`Failed to read audio file: ${audioFilePath}`)
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: includeTimestamps ? "verbose_json" : "text",
      timestamp_granularities: includeTimestamps ? ["segment"] : undefined,
    })

    // Clean up temporary converted file if created
    if (audioFilePath !== filePath) {
      fs.unlinkSync(audioFilePath)
    }

    if (typeof transcription === 'string') {
      return transcription
    }

    if (includeTimestamps && 'segments' in transcription) {
      return (transcription as VerboseTranscription).segments.map(segment => ({
        text: segment.text,
        start: segment.start,
        end: segment.end,
      }));
    }

    // If timestamps were requested but not provided in the response
    if (includeTimestamps) {
      console.warn('Timestamps were requested but not provided in the API response')
      return [{ text: transcription.text, start: 0, end: 0 }]
    }

    return transcription.text
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to transcribe audio')
  } finally {
    audioFile.destroy()
  }
}

interface VerboseTranscription {
  segments: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}
