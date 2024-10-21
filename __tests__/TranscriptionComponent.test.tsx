import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TranscriptionComponent } from '../components/TranscriptionComponent'

// Mock the RouteTs component
jest.mock('../components/app-api-transcribe-route', () => ({
  RouteTs: ({ onTranscriptionComplete, setIsLoading }: { onTranscriptionComplete: Function, setIsLoading: Function }) => (
    <div>
      Mocked RouteTs
      <button onClick={() => onTranscriptionComplete('Test transcription')}>Complete Transcription</button>
      <button onClick={() => setIsLoading(true)}>Set Loading</button>
    </div>
  )
}))

describe('TranscriptionComponent', () => {
  it('renders without crashing', () => {
    render(<TranscriptionComponent />)
    expect(screen.getByText('Mocked RouteTs')).toBeInTheDocument()
    expect(screen.getByText('No transcription available yet.')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    render(<TranscriptionComponent />)
    screen.getByText('Set Loading').click()
    expect(screen.getByText('Transcribing audio...')).toBeInTheDocument()
  })

  it('displays transcription when completed', () => {
    render(<TranscriptionComponent />)
    screen.getByText('Complete Transcription').click()
    expect(screen.getByText('Test transcription')).toBeInTheDocument()
  })
})
