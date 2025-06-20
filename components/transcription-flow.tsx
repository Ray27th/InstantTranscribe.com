import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/file-upload";
import { CheckCircle, Loader2, Download, Clock, DollarSign } from "lucide-react";
import { 
  generateRealPreviewTranscript, 
  generateRealFullTranscript,
  generateSRTFormat,
  formatTranscriptWithTimestamps,
  type TranscriptionResult,
  validateTranscriptionFile
} from "@/lib/transcription-service";
import { formatDuration, calculateCost } from "@/lib/file-utils";

interface TranscriptionFlowProps {
  onBack: () => void;
}

export const TranscriptionFlow = ({ onBack }: TranscriptionFlowProps) => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [cost, setCost] = useState<number>(0);
  const [previewResult, setPreviewResult] = useState<TranscriptionResult | null>(null);
  
  // Debug: Log when previewResult changes
  useEffect(() => {
    if (previewResult) {
      console.log('previewResult state updated:', {
        transcript: previewResult.transcript?.substring(0, 100) + '...',
        confidence: previewResult.confidence,
        fullTranscript: previewResult.transcript
      });
    }
  }, [previewResult]);
  const [fullResult, setFullResult] = useState<TranscriptionResult | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  // Generate preview transcript
  useEffect(() => {
    if (currentStep === 'preview' && uploadedFile) {
      // Validate file first
      const validation = validateTranscriptionFile(uploadedFile);
      if (!validation.valid) {
        setProcessingStatus(`Error: ${validation.error}`);
        return;
      }

      generateRealPreviewTranscript(uploadedFile, (progress, status) => {
        setProcessingProgress(progress);
        setProcessingStatus(status);
      })
        .then((result) => {
          console.log('Frontend received preview result:', {
            transcript: result.transcript?.substring(0, 100) + '...',
            confidence: result.confidence,
            fullTranscript: result.transcript,
            isRealTranscription: !result.transcript?.includes('demo mode') && !result.transcript?.includes('sample transcription')
          });
          setPreviewResult(result);
          setCurrentStep('preview-result');
        })
        .catch((error) => {
          console.error('Preview generation failed:', error);
          setProcessingStatus(`Error: ${error.message}`);
        });
    }
  }, [currentStep, uploadedFile]);

  // Generate full transcript after payment
  useEffect(() => {
    if (currentStep === 'processing' && uploadedFile) {
      setProcessingProgress(0);
      setProcessingStatus('');
      
      generateRealFullTranscript(uploadedFile, (progress, status) => {
        setProcessingProgress(progress);
        setProcessingStatus(status);
      })
        .then((result) => {
          setFullResult(result);
          setCurrentStep('complete');
        })
        .catch((error) => {
          console.error('Full transcription failed:', error);
          setProcessingStatus(`Error: ${error.message}`);
        });
    }
  }, [currentStep, uploadedFile]);

  // Progress indicator steps
  const steps = [
    { key: 'upload', label: 'Upload', icon: '📁' },
    { key: 'preview', label: 'Preview', icon: '👁️' },
    { key: 'payment', label: 'Payment', icon: '💳' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'complete', label: 'Download', icon: '📥' },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => 
      step.key === currentStep || 
      (currentStep === 'preview-result' && step.key === 'preview')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with back button */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
          <button 
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-bold ml-8">Audio Transcription</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {/* Enhanced Progress indicator */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, idx) => {
                const isActive = idx === getCurrentStepIndex();
                const isCompleted = idx < getCurrentStepIndex();
                
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold transition-all
                      ${isActive ? 'bg-blue-600 text-white scale-110' : 
                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : step.icon}
                    </div>
                    <span className={`mt-2 text-sm font-medium transition-colors
                      ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Step with FileUpload UI */}
        {currentStep === 'upload' && (
          <FileUpload
            onFileReady={(fileObj) => {
              setUploadedFile(fileObj.file);
              setDuration(fileObj.duration || null);
              setCost(fileObj.cost);
              setCurrentStep('preview');
            }}
          />
        )}

        {/* Preview Processing Step */}
        {currentStep === 'preview' && (
          <Card className="animate-fade-in">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Analyzing first 60 seconds...</h2>
                <p className="text-gray-600">This free preview lets you check our transcription quality before paying.</p>
              </div>
              
              <div className="space-y-4">
                <Progress value={processingProgress} className="h-3" />
                <p className="text-sm text-blue-600 font-medium">{processingStatus}</p>
              </div>
              
              {uploadedFile && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {duration && formatDuration(duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${cost.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview Result Step */}
        {currentStep === 'preview-result' && previewResult && (
          <Card className="animate-fade-in">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Here's your preview!</h2>
                <p className="text-gray-600">See the quality and accuracy of our transcription service</p>
                {processingStatus.includes('Demo mode') && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm font-medium">
                      🚀 Demo Mode Active - Add OpenAI API key for real transcription!
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg mb-6 border-l-4 border-blue-500">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Preview • First 60 seconds
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {(previewResult.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">
                    {previewResult.transcript}
                  </pre>
                  {/* Debug info */}
                  <div className="mt-4 p-2 bg-red-100 text-xs text-red-800 border rounded">
                    <strong>DEBUG:</strong> Transcript length: {previewResult.transcript?.length}, 
                    First 50 chars: "{previewResult.transcript?.substring(0, 50)}..."
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-semibold">
                    This is just a preview of the first 60 seconds.
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Unlock the complete transcript with timestamps and enhanced accuracy.
                  </p>
                </div>
                
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                  onClick={() => setCurrentStep('payment')}
                >
                  Unlock Full Transcript • ${cost.toFixed(2)}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Step */}
        {currentStep === 'payment' && (
          <Card className="animate-fade-in">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Unlock Your Complete Transcript</h2>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">File</p>
                    <p className="font-semibold truncate">{uploadedFile?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{duration && formatDuration(duration)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-green-600">${cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  You've seen the preview quality. Get your complete transcript with:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Complete transcription</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Timestamp precision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Multiple download formats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Enhanced accuracy</span>
                  </div>
                </div>
                
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 mt-6"
                  onClick={() => setCurrentStep('processing')}
                >
                  Pay ${cost.toFixed(2)} & Process Full File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Processing Step */}
        {currentStep === 'processing' && (
          <Card className="animate-fade-in">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Processing complete file...</h2>
                <p className="text-gray-600">Generating your full transcript with enhanced accuracy</p>
              </div>
              
              <div className="space-y-4">
                <Progress value={processingProgress} className="h-3" />
                <p className="text-sm text-green-600 font-medium">{processingStatus}</p>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-semibold">Payment confirmed!</p>
                <p className="text-green-700 text-sm">Processing your complete {duration && formatDuration(duration)} file...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Step */}
        {currentStep === 'complete' && fullResult && (
          <Card className="animate-fade-in">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your Transcript is Ready!</h2>
                <p className="text-gray-600">
                  Processed with {(fullResult.confidence * 100).toFixed(1)}% confidence
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg mb-6 max-h-96 overflow-y-auto">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                    {fullResult.transcript}
                  </pre>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([fullResult.transcript], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${uploadedFile?.name?.replace(/\.[^/.]+$/, '') || 'transcript'}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download TXT
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const timestampedTranscript = formatTranscriptWithTimestamps(
                      fullResult.transcript, 
                      fullResult.segments
                    );
                    const blob = new Blob([timestampedTranscript], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${uploadedFile?.name?.replace(/\.[^/.]+$/, '') || 'transcript'}_timestamped.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={!fullResult.segments || fullResult.segments.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download with Timestamps
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const srtContent = generateSRTFormat(fullResult.segments);
                    if (srtContent) {
                      const blob = new Blob([srtContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${uploadedFile?.name?.replace(/\.[^/.]+$/, '') || 'transcript'}.srt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  disabled={!fullResult.segments || fullResult.segments.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SRT
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 