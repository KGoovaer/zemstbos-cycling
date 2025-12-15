'use client'

import { useState, useRef } from 'react'
import { validateGPXFile, parseGPX, GPXMetadata } from '@/lib/gpx-parser'

interface GPXUploadFormProps {
  onParsed: (gpxData: string, metadata: GPXMetadata) => void
}

export function GPXUploadForm({ onParsed }: GPXUploadFormProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setIsProcessing(true)

    try {
      const gpxContent = await validateGPXFile(file)
      const metadata = parseGPX(gpxContent)
      onParsed(gpxContent, metadata)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij verwerken GPX bestand')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const gpxFile = files.find((f) => f.name.toLowerCase().endsWith('.gpx'))

    if (gpxFile) {
      handleFile(gpxFile)
    } else {
      setError('Geen geldig GPX bestand gevonden')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-4 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          onChange={handleFileSelect}
          disabled={isProcessing}
          className="hidden"
        />

        <div className="space-y-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {isProcessing ? 'Bestand verwerken...' : 'Sleep een GPX bestand hierheen'}
            </p>
            <p className="text-lg text-gray-500">
              of klik om een bestand te selecteren
            </p>
          </div>

          <p className="text-base text-gray-400">
            Maximum bestandsgrootte: 5MB
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="h-6 w-6 text-red-600 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-base text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
