import { useCallback, useRef } from 'react';
import { useAIPipeline } from '../services/AIPipelineService';

export const useFaceRecognition = (
  mode: 'ENROLLMENT' | 'ATTENDANCE',
  onDetection: (result: any) => void
) => {
  const { modelsLoaded } = useAIPipeline();
  const isProcessingRef = useRef(false);

  const processDetectionResult = useCallback((result: any) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    onDetection(result);
  }, [onDetection]);

  // Mock frame processor to avoid VisionCamera crash without worklets-core
  const frameProcessor = undefined;

  return {
    frameProcessor,
    setIsProcessing: (val: boolean) => { isProcessingRef.current = val; }
  };
};
