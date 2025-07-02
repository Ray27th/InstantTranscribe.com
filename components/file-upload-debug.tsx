"use client"

import { useState, useRef } from 'react'
import { validateFile, ALL_SUPPORTED_TYPES, SUPPORTED_EXTENSIONS } from '@/lib/file-utils'

export function FileUploadDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const validation = validateFile(file)
    
    const debug = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileExtension: fileExtension,
      lastModified: new Date(file.lastModified).toISOString(),
      validation: validation,
      isSupportedMimeType: ALL_SUPPORTED_TYPES.includes(file.type),
      isSupportedExtension: SUPPORTED_EXTENSIONS.includes(fileExtension),
      allSupportedTypes: ALL_SUPPORTED_TYPES,
      supportedExtensions: SUPPORTED_EXTENSIONS,
      isM4A: fileExtension === '.m4a' || file.type === 'audio/m4a',
      browserReportedType: file.type,
      expectedM4ATypes: ['audio/m4a', 'audio/mp4']
    }
    
    setDebugInfo(debug)
    console.log('🔍 File Debug Info:', debug)
  }

  return (
    <div className="p-6 border rounded-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">M4A File Upload Debug Tool</h2>
      
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".m4a,audio/m4a,audio/mp4"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-sm text-gray-600 mt-2">Select your M4A file to debug upload issues</p>
      </div>

      {debugInfo && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <pre className="text-sm overflow-auto bg-white p-3 rounded border">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          <div className="mt-4 space-y-2">
            <div className={`p-2 rounded ${debugInfo.validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Validation Result:</strong> {debugInfo.validation.isValid ? '✅ VALID' : '❌ INVALID'}
              {!debugInfo.validation.isValid && (
                <div className="mt-1 text-sm">
                  <strong>Error:</strong> {debugInfo.validation.error}
                </div>
              )}
            </div>
            
            <div className="p-2 bg-blue-100 text-blue-800 rounded">
              <strong>Browser MIME Type:</strong> {debugInfo.browserReportedType || 'Unknown'}
            </div>
            
            <div className="p-2 bg-purple-100 text-purple-800 rounded">
              <strong>File Extension:</strong> {debugInfo.fileExtension}
            </div>
            
            <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
              <strong>Is M4A:</strong> {debugInfo.isM4A ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 