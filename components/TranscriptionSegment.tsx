import React from 'react'

interface SegmentProps {
  segment: {
    text: string;
    start: number;
    end: number;
  }
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const milliseconds = Math.floor((time % 1) * 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

export function TranscriptionSegment({ segment }: SegmentProps) {
  console.log("Rendering segment:", segment);
  
  return (
    <div className="flex items-start space-x-4 py-2 border-b border-gray-200 last:border-b-0">
      <div className="flex-shrink-0 w-32 text-sm text-gray-500 font-mono">
        {formatTime(segment.start)} - {formatTime(segment.end)}
      </div>
      <p className="flex-grow">{segment.text}</p>
    </div>
  )
}
