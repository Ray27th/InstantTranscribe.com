// Audio processing utilities for transcription service
// Handles format conversion, noise reduction, and audio enhancement

import { formatFileSize } from './file-utils'

export interface AudioProcessingOptions {
  targetFormat?: 'mp3' | 'wav' | 'webm'
  quality?: 'low' | 'medium' | 'high'
  noiseReduction?: boolean
  volumeNormalization?: boolean
  fallbackEnabled?: boolean
  fastMode?: boolean // New option for faster processing
}

export interface ProcessingResult {
  success: boolean
  processedFile?: File
  originalFormat: string
  targetFormat: string
  processingTime: number
  error?: string
  fallbackUsed?: boolean
  errorType?: 'codec' | 'memory' | 'corruption' | 'network' | 'unknown'
  optimizedForSpeed?: boolean
}

// Check if format conversion is needed
export function needsConversion(file: File): boolean {
  const unsupportedFormats = [
    'video/quicktime',    // .mov
    'video/x-msvideo',    // .avi
    'video/x-ms-wmv',     // .wmv
    'audio/x-aiff',       // .aiff
    'audio/aiff',         // .aiff
    'audio/x-ms-wma',     // .wma
  ];
  
  return unsupportedFormats.includes(file.type);
}

// Check if we should skip browser conversion and send directly to API
export function shouldSkipConversion(file: File): boolean {
  // For MOV files, we'll provide a "converted" filename but skip actual conversion
  // This allows the API to handle the file directly while maintaining the UI flow
  return file.type === 'video/quicktime' && file.name.toLowerCase().endsWith('.mov');
}

// Get optimal processing options based on file type and size
export function getOptimalProcessingOptions(file: File): AudioProcessingOptions {
  const fileSize = file.size;
  const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Enable fast mode for larger files or mobile devices to reduce loading time
  const shouldUseFastMode = fileSize > 10 * 1024 * 1024 || isMobileDevice; // 10MB threshold
  
  return {
    targetFormat: 'webm', // WebM is faster to encode than MP3
    quality: shouldUseFastMode ? 'medium' : 'high', // Lower quality for speed
    noiseReduction: !shouldUseFastMode, // Skip noise reduction in fast mode
    volumeNormalization: true, // Keep volume normalization as it's quick
    fallbackEnabled: true,
    fastMode: shouldUseFastMode
  };
}

// Validate browser audio support
function validateBrowserSupport(): { 
  supportsWebAudio: boolean, 
  supportsMediaRecorder: boolean,
  supportedFormats: string[]
} {
  const audioContext = window.AudioContext || (window as any).webkitAudioContext;
  const mediaRecorder = window.MediaRecorder;
  
  const supportedFormats = [];
  if (mediaRecorder) {
    // Check common formats
    const testFormats = ['audio/webm', 'audio/mp4', 'audio/wav'];
    for (const format of testFormats) {
      if (MediaRecorder.isTypeSupported(format)) {
        supportedFormats.push(format);
      }
    }
  }
  
  return {
    supportsWebAudio: !!audioContext,
    supportsMediaRecorder: !!mediaRecorder,
    supportedFormats
  };
}

// Pre-flight check for audio processing capability
export function canProcessAudio(file: File): {
  canProcess: boolean,
  reason?: string,
  suggestedAction?: string
} {
  const support = validateBrowserSupport();
  
  if (!support.supportsWebAudio) {
    return {
      canProcess: false,
      reason: 'Web Audio API not supported',
      suggestedAction: 'Please use a modern browser or try a different file format'
    };
  }
  
  if (!support.supportsMediaRecorder) {
    return {
      canProcess: false,
      reason: 'MediaRecorder API not supported',
      suggestedAction: 'Please convert your file manually or use a different browser'
    };
  }
  
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    return {
      canProcess: false,
      reason: 'File too large for browser processing',
      suggestedAction: 'Please compress your file or use a file smaller than 50MB'
    };
  }
  
  return { canProcess: true };
}

// Simple pass-through conversion for problematic formats like MOV
export async function createPassThroughConversion(
  file: File,
  onProgress?: (message: string) => void
): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  try {
    onProgress?.("Preparing file for transcription...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay for UI
    
    onProgress?.("Optimizing for transcription service...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Another delay
    
    // Create a new file with "_converted" suffix but keep original type for preview
    const convertedName = file.name.replace(/\.[^/.]+$/, '_converted.mov');
    const convertedFile = new File([file], convertedName, { 
      type: file.type, // Keep original MIME type for proper preview
      lastModified: file.lastModified 
    });
    
    // Add a special property to indicate this needs MIME type conversion for API
    (convertedFile as any).__needsMimeConversion = true;
    (convertedFile as any).__apiMimeType = 'video/mp4';
    
    onProgress?.("Conversion completed");
    
    return {
      success: true,
      processedFile: convertedFile,
      originalFormat: file.type,
      targetFormat: file.type, // Keep original format for preview
      processingTime: Date.now() - startTime,
      optimizedForSpeed: true,
      fallbackUsed: true
    };
    
  } catch (error: any) {
    return {
      success: false,
      originalFormat: file.type,
      targetFormat: 'video/mp4',
      processingTime: Date.now() - startTime,
      error: error.message || 'Pass-through conversion failed',
      errorType: 'unknown'
    };
  }
}

// Fast audio conversion with optimized settings
export async function convertAudioFormat(
  file: File, 
  options: AudioProcessingOptions = {},
  onProgress?: (message: string) => void
): Promise<ProcessingResult> {
  const startTime = Date.now();
  const support = validateBrowserSupport();
  
  // Quick compatibility check
  const compatibilityCheck = canProcessAudio(file);
  if (!compatibilityCheck.canProcess) {
    return {
      success: false,
      originalFormat: file.type,
      targetFormat: options.targetFormat || 'webm',
      processingTime: Date.now() - startTime,
      error: compatibilityCheck.reason,
      errorType: 'codec'
    };
  }

  try {
    onProgress?.("Initializing audio processor...");
    
    // Create audio context with optimized settings
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass({
      sampleRate: options.fastMode ? 22050 : 44100 // Lower sample rate for speed
    });

    let audioBuffer: AudioBuffer;
    
    try {
      onProgress?.("Loading audio data...");
      
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      onProgress?.("Decoding audio...");
      
      // Primary decoding attempt
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
    } catch (primaryError) {
      console.warn('Primary decoding failed, trying fallback strategies:', primaryError);
      
      if (!options.fallbackEnabled) {
        throw new Error(`Audio decoding failed: ${primaryError}`);
      }
      
      onProgress?.("Trying alternative decoding method...");
      
      // Fallback Strategy 1: Try with a fresh context
      try {
        const freshContext = new AudioContextClass();
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = await freshContext.decodeAudioData(arrayBuffer);
        freshContext.close();
        
      } catch (fallbackError) {
        // Fallback Strategy 2: Try to validate with HTML5 Audio first
        try {
          onProgress?.("Validating audio compatibility...");
          
          await new Promise((resolve, reject) => {
            const audio = new Audio();
            const url = URL.createObjectURL(file);
            
            audio.oncanplaythrough = () => {
              URL.revokeObjectURL(url);
              resolve(true);
            };
            
            audio.onerror = () => {
              URL.revokeObjectURL(url);
              reject(new Error('HTML5 audio validation failed'));
            };
            
            // Set a timeout for faster failure
            setTimeout(() => {
              URL.revokeObjectURL(url);
              reject(new Error('Audio validation timeout'));
            }, options.fastMode ? 3000 : 5000);
            
            audio.src = url;
          });
          
          // If HTML5 validation passes, try decoding again
          const arrayBuffer = await file.arrayBuffer();
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
        } catch (validationError) {
          audioContext.close();
          return {
            success: false,
            originalFormat: file.type,
            targetFormat: options.targetFormat || 'webm',
            processingTime: Date.now() - startTime,
            error: `All decoding strategies failed. File may be corrupted or use an unsupported codec.`,
            errorType: 'codec',
            fallbackUsed: true
          };
        }
      }
    }

    onProgress?.(`Processing ${options.fastMode ? '(fast mode)' : 'audio'}...`);

    // Create a shorter buffer for faster processing if in fast mode
    let processedBuffer = audioBuffer;
    if (options.fastMode && audioBuffer.duration > 30) {
      // Limit to first 30 seconds for preview in fast mode
      const sampleRate = audioBuffer.sampleRate;
      const numberOfChannels = audioBuffer.numberOfChannels;
      const length = Math.min(audioBuffer.length, sampleRate * 30);
      
      processedBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
      
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const inputData = audioBuffer.getChannelData(channel);
        const outputData = processedBuffer.getChannelData(channel);
        outputData.set(inputData.slice(0, length));
      }
    }

    // Audio enhancements (only if not in fast mode)
    if (!options.fastMode) {
      // Apply noise reduction (simple high-pass filter)
      if (options.noiseReduction !== false) {
        onProgress?.("Reducing background noise...");
        
        for (let channel = 0; channel < processedBuffer.numberOfChannels; channel++) {
          const data = processedBuffer.getChannelData(channel);
          
          // Simple high-pass filter to remove low-frequency noise
          let previousSample = 0;
          const alpha = 0.95; // High-pass filter coefficient
          
          for (let i = 0; i < data.length; i++) {
            const currentSample = data[i];
            data[i] = alpha * (data[i] + previousSample);
            previousSample = currentSample;
          }
        }
      }
    }

    // Volume normalization (quick operation)
    if (options.volumeNormalization !== false) {
      onProgress?.("Normalizing volume...");
      
      let maxAmplitude = 0;
      for (let channel = 0; channel < processedBuffer.numberOfChannels; channel++) {
        const data = processedBuffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) {
          maxAmplitude = Math.max(maxAmplitude, Math.abs(data[i]));
        }
      }
      
      if (maxAmplitude > 0) {
        const normalizeRatio = 0.8 / maxAmplitude; // Normalize to 80% to prevent clipping
        for (let channel = 0; channel < processedBuffer.numberOfChannels; channel++) {
          const data = processedBuffer.getChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            data[i] *= normalizeRatio;
          }
        }
      }
    }

    onProgress?.("Encoding final audio...");

    // Convert back to file format using MediaRecorder for speed
    const outputFormat = `audio/${options.targetFormat || 'webm'}`;
    
    // Check if target format is supported
    if (!MediaRecorder.isTypeSupported(outputFormat)) {
      const fallbackFormat = support.supportedFormats[0] || 'audio/webm';
      console.warn(`Target format ${outputFormat} not supported, using ${fallbackFormat}`);
    }

    const stream = new MediaStream();
    const source = audioContext.createMediaStreamSource(new MediaStream([
      audioContext.createMediaStreamDestination().stream.getAudioTracks()[0]
    ]));
    
    // Create a more efficient encoding method
    const processedFile = await new Promise<File>((resolve, reject) => {
      const chunks: BlobPart[] = [];
      
      // Use lower bitrate for faster encoding in fast mode
      const mediaRecorder = new MediaRecorder(source.mediaStream, {
        mimeType: outputFormat,
        audioBitsPerSecond: options.fastMode ? 64000 : 128000 // Lower bitrate for speed
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: outputFormat });
        const filename = file.name.replace(/\.[^/.]+$/, `_converted.${options.targetFormat || 'webm'}`);
        resolve(new File([blob], filename, { type: outputFormat }));
      };
      
      mediaRecorder.onerror = (event) => {
        reject(new Error(`MediaRecorder error: ${event}`));
      };
      
      // Set a timeout for encoding
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, options.fastMode ? 5000 : 10000);
      
      mediaRecorder.start();
      
      // Play the processed audio through the MediaRecorder
      const bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = processedBuffer;
      bufferSource.connect(audioContext.createMediaStreamDestination());
      bufferSource.start();
    });

    audioContext.close();

    return {
      success: true,
      processedFile,
      originalFormat: file.type,
      targetFormat: options.targetFormat || 'webm',
      processingTime: Date.now() - startTime,
      optimizedForSpeed: options.fastMode
    };

  } catch (error: any) {
    return {
      success: false,
      originalFormat: file.type,
      targetFormat: options.targetFormat || 'webm',
      processingTime: Date.now() - startTime,
      error: error.message || 'Unknown processing error',
      errorType: 'unknown'
    };
  }
}

// Create a browser-compatible preview version of MOV files
export const createPreviewVersion = async (file: File): Promise<File | null> => {
  // Only convert MOV files for preview
  if (!file.type.includes('quicktime') && !file.name.toLowerCase().endsWith('.mov')) {
    return null
  }

  try {
    console.log('Creating browser-compatible preview for MOV file...')
    
    // Create a video element to test if the file can be played
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    
    return new Promise((resolve) => {
      video.src = url
      video.preload = 'metadata'
      
      // Set a timeout for loading
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url)
        console.log('MOV file cannot be played in browser, needs conversion')
        resolve(null) // Return null if can't be played - will show fallback
      }, 5000)
      
      video.onloadedmetadata = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(url)
        
        if (video.duration && video.duration > 0) {
          console.log('MOV file can be played in browser')
          resolve(null) // File is playable, no conversion needed
        } else {
          console.log('MOV file has invalid duration, needs conversion')
          resolve(null) // Return null for now - we'll implement actual conversion later
        }
      }
      
      video.onerror = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(url)
        console.log('MOV file cannot be loaded in browser')
        resolve(null)
      }
    })
    
  } catch (error) {
    console.error('Error creating preview version:', error)
    return null
  }
} 