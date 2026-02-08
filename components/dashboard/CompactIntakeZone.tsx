'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function CompactIntakeZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) return
    
    setUploading(true)
    // Simulate upload - in real implementation, this would upload to your backend
    setTimeout(() => {
      setUploading(false)
      router.push('/dashboard')
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-emerald-600" />
        <h3 className="font-semibold text-navy-900">Quick Submit</h3>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-50/50' 
            : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50/50'
          }
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {!file ? (
          <div className="space-y-3">
            <Upload className="h-10 w-10 mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop land title document here
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or click to browse (PDF only)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <CheckCircle className="h-10 w-10 mx-auto text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-gray-700 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {file && (
        <Button
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Submit for Verification'
          )}
        </Button>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• AI verification starts automatically</p>
        <p>• Results typically within 2-5 minutes</p>
        <p>• 1 credit per submission</p>
      </div>
    </div>
  )
}
