import { FileUploadDebug } from '@/components/file-upload-debug'

export default function DebugM4APage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">M4A Upload Debug</h1>
        <FileUploadDebug />
        
        <div className="mt-8 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Common M4A Issues & Solutions</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Browser MIME Type Variations</h3>
              <p className="text-blue-800 text-sm mt-1">
                Different browsers might report M4A files with different MIME types:
                <br />• <code>audio/m4a</code> (expected)
                <br />• <code>audio/mp4</code> (common)
                <br />• <code>audio/x-m4a</code> (some browsers)
                <br />• <code>application/octet-stream</code> (fallback)
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900">File Size Limits</h3>
              <p className="text-yellow-800 text-sm mt-1">
                • Maximum file size: 2GB for frontend processing
                <br />• Maximum for transcription API: 25MB
                <br />• Minimum file size: 100 bytes
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Troubleshooting Steps</h3>
              <p className="text-green-800 text-sm mt-1">
                1. Check the debug info above after selecting your M4A file
                <br />2. Look at the "Browser MIME Type" - it should be audio/m4a or audio/mp4
                <br />3. Verify the file extension is .m4a
                <br />4. Ensure file size is between 100 bytes and 2GB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 