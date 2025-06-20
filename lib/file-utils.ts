// File processing utilities for transcription app

export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg', // MP3
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/x-flac',
];

// Video formats directly supported by OpenAI Whisper
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
];

// Video formats that require conversion before transcription
export const CONVERSION_REQUIRED_VIDEO_TYPES = [
  'video/quicktime',    // .mov
  'video/x-msvideo',    // .avi
  'video/x-ms-wmv',     // .wmv
];

// Audio formats that require conversion
export const CONVERSION_REQUIRED_AUDIO_TYPES = [
  'audio/x-aiff',       // .aiff
  'audio/aiff',         // .aiff
  'audio/x-ms-wma',     // .wma
];

export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_AUDIO_TYPES, 
  ...SUPPORTED_VIDEO_TYPES,
  ...CONVERSION_REQUIRED_VIDEO_TYPES,
  ...CONVERSION_REQUIRED_AUDIO_TYPES
];

// File extensions as backup validation
export const SUPPORTED_EXTENSIONS = [
  '.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm', '.flac',
  '.mp4', '.mov', '.avi', '.webm'
];

export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
export const PRICE_PER_MINUTE = 0.18;

// Extract real duration from audio/video file
export const getFileDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Set a timeout to prevent hanging
    const timeout = 15000; // 15 seconds
    timeoutId = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error('Timeout while loading media file. The file may be corrupted or in an unsupported format.'));
    }, timeout);
    
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      URL.revokeObjectURL(url);
    };
    
    if (file.type.startsWith('audio/')) {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        cleanup();
        const durationInMinutes = Math.ceil(audio.duration / 60);
        console.log(`📊 Audio duration: ${audio.duration} seconds = ${durationInMinutes} minutes`);
        resolve(durationInMinutes);
      });
      audio.addEventListener('error', (e) => {
        cleanup();
        console.error('Audio loading error:', e);
        // Fallback: estimate duration based on file size
        const estimatedMinutes = Math.max(1, Math.round(file.size / (1024 * 128))); // 128KB per minute estimate
        console.log(`📊 Using fallback duration estimate: ${estimatedMinutes} minutes`);
        resolve(estimatedMinutes);
      });
      audio.addEventListener('abort', () => {
        cleanup();
        console.warn('Audio loading was aborted');
        const estimatedMinutes = Math.max(1, Math.round(file.size / (1024 * 128)));
        resolve(estimatedMinutes);
      });
      audio.src = url;
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.addEventListener('loadedmetadata', () => {
        cleanup();
        const durationInMinutes = Math.ceil(video.duration / 60);
        console.log(`📊 Video duration: ${video.duration} seconds = ${durationInMinutes} minutes`);
        resolve(durationInMinutes);
      });
      video.addEventListener('error', (e) => {
        cleanup();
        console.error('Video loading error:', e);
        // Fallback: estimate duration based on file size
        const estimatedMinutes = Math.max(1, Math.round(file.size / (1024 * 1024 * 2))); // 2MB per minute estimate for video
        console.log(`📊 Using fallback duration estimate: ${estimatedMinutes} minutes`);
        resolve(estimatedMinutes);
      });
      video.addEventListener('abort', () => {
        cleanup();
        console.warn('Video loading was aborted');
        const estimatedMinutes = Math.max(1, Math.round(file.size / (1024 * 1024 * 2)));
        resolve(estimatedMinutes);
      });
      video.src = url;
    } else {
      cleanup();
      // For unknown types, estimate based on file size
      const estimatedMinutes = Math.max(1, Math.round(file.size / (1024 * 128)));
      console.log(`📊 Unknown file type, using size-based estimate: ${estimatedMinutes} minutes`);
      resolve(estimatedMinutes);
    }
  });
};

// Get file extension
const getFileExtension = (filename: string): string => {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
};

// Check if a file needs conversion before transcription
export const needsConversion = (file: File): boolean => {
  return [...CONVERSION_REQUIRED_VIDEO_TYPES, ...CONVERSION_REQUIRED_AUDIO_TYPES].includes(file.type);
};

// Validate file type and size
export const validateFile = (file: File) => {
  const fileExtension = getFileExtension(file.name);
  
  // Check file type (MIME type first, then extension as backup)
  const isSupportedMimeType = ALL_SUPPORTED_TYPES.includes(file.type);
  const isSupportedExtension = SUPPORTED_EXTENSIONS.includes(fileExtension);
  
  if (!isSupportedMimeType && !isSupportedExtension) {
    return {
      isValid: false,
      error: `Unsupported file format "${fileExtension}". Please upload audio files (MP3, WAV, M4A, AAC, FLAC) or video files (MP4, MOV, AVI).`
    };
  }

  // Check for obviously wrong files (like JSON, text files, etc.)
  const forbiddenExtensions = ['.json', '.txt', '.js', '.html', '.css', '.md', '.pdf', '.doc', '.docx'];
  if (forbiddenExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Cannot transcribe "${fileExtension}" files. Please upload audio or video files only.`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / (1024 * 1024));
    return {
      isValid: false,
      error: `File size (${sizeMB}MB) exceeds the 2GB limit. Please compress your file or upload a smaller one.`
    };
  }

  // Check for very small files (likely not audio/video) - reduced to 100 bytes
  if (file.size < 100) { // Less than 100 bytes
    return {
      isValid: false,
      error: `File is too small (${file.size} bytes). Please upload a valid audio or video file.`
    };
  }

  return { isValid: true };
};

// Calculate cost based on duration
export const calculateCost = (durationInMinutes: number): number => {
  return Math.max(0.50, durationInMinutes * PRICE_PER_MINUTE); // Minimum $0.50
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format duration for display
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// Download transcript as text file
export const downloadTranscript = (transcript: string, filename: string = 'transcript') => {
  const blob = new Blob([transcript], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Download transcript as SRT file (with timestamps)
export const downloadSRT = (segments: any[], filename: string = 'transcript') => {
  let srtContent = '';
  
  segments.forEach((segment, index) => {
    const startTime = formatSRTTime(segment.start || 0);
    const endTime = formatSRTTime(segment.end || segment.start + 5);
    
    srtContent += `${index + 1}\n`;
    srtContent += `${startTime} --> ${endTime}\n`;
    srtContent += `${segment.text.trim()}\n\n`;
  });
  
  const blob = new Blob([srtContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.srt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Format time for SRT format (HH:MM:SS,mmm)
const formatSRTTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
};

// Download transcript as JSON file (with metadata)
export const downloadJSON = (transcriptionResult: any, filename: string = 'transcript', originalFile?: any) => {
  const jsonData = {
    metadata: {
      filename: originalFile?.name || filename,
      fileSize: originalFile?.size,
      duration: originalFile?.duration,
      confidence: transcriptionResult.confidence,
      speakerCount: transcriptionResult.speakerCount,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    },
    transcript: {
      fullText: transcriptionResult.fullTranscript,
      segments: transcriptionResult.segments || [],
      wordCount: transcriptionResult.fullTranscript ? transcriptionResult.fullTranscript.split(' ').length : 0
    }
  };
  
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Download transcript as VTT file (WebVTT format for web videos)
export const downloadVTT = (segments: any[], filename: string = 'transcript') => {
  let vttContent = 'WEBVTT\n\n';
  
  segments.forEach((segment, index) => {
    const startTime = formatVTTTime(segment.start || 0);
    const endTime = formatVTTTime(segment.end || segment.start + 5);
    
    vttContent += `${startTime} --> ${endTime}\n`;
    vttContent += `${segment.text.trim()}\n\n`;
  });
  
  const blob = new Blob([vttContent], { type: 'text/vtt' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.vtt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Format time for VTT format (HH:MM:SS.mmm)
const formatVTTTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err);
    return false;
  }
};

// Download enhanced report with formatting
export const downloadEnhancedReport = (transcriptionResult: any, filename: string = 'transcript', originalFile?: any) => {
  const report = `TRANSCRIPTION REPORT
===================

File Information:
- Name: ${originalFile?.name || 'Unknown'}
- Size: ${originalFile?.size ? formatFileSize(originalFile.size) : 'Unknown'}
- Duration: ${originalFile?.duration ? formatDuration(originalFile.duration) : 'Unknown'}
- Type: ${originalFile?.type || 'Unknown'}

Transcription Details:
- Accuracy: ${transcriptionResult.confidence ? (transcriptionResult.confidence * 100).toFixed(1) + '%' : 'Unknown'}
- Speakers Detected: ${transcriptionResult.speakerCount || 'Unknown'}
- Word Count: ${transcriptionResult.fullTranscript ? transcriptionResult.fullTranscript.split(' ').length : 0}
- Generated: ${new Date().toLocaleString()}

TRANSCRIPT:
-----------

${transcriptionResult.fullTranscript || 'No transcript available'}

${transcriptionResult.segments && transcriptionResult.segments.length > 0 ? `
TIMESTAMPED SEGMENTS:
---------------------

${transcriptionResult.segments.map((segment: any, index: number) => 
  `[${formatTime(segment.start || 0)} - ${formatTime(segment.end || segment.start + 5)}] ${segment.text}`
).join('\n')}
` : ''}

---
Generated by TranscribeFree.online
Visit: https://transcribefree.online
`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_report.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Format time for display (MM:SS)
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}; 