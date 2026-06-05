import { useCallback, useRef } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { useAIPipeline } from '../services/AIPipelineService';

export const useFaceRecognition = (
  mode: 'ENROLLMENT' | 'ATTENDANCE',
  onDetection: (result: any) => void
) => {
  const { blazefaceModel, mobilefacenetModel, antispoofingModel, facemeshModel } = useAIPipeline();
  const isProcessingRef = useRef(false);

  const processDetectionResult = useCallback((result: any) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    onDetection(result);
  }, [onDetection]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // Safety check: models must be loaded
    if (!blazefaceModel || !mobilefacenetModel) {
      return;
    }

    // This block represents the worklet code that runs on the Vision Camera thread.
    // In a real application, you would:
    // 1. Resize/Crop the frame to BlazeFace expected input (e.g., 128x128)
    // 2. Run blazefaceModel.runSync([inputData])
    // 3. Extract bounding boxes
    // 4. If face detected -> crop face from frame, resize to 112x112 for MobileFaceNet
    // 5. Run mobilefacenetModel.runSync([croppedFace]) -> returns 128-float embedding
    // 6. If attendance mode -> run antispoofingModel.runSync([croppedFace])
    // 7. runOnJS(processDetectionResult)({ embedding, livenessScore, boundingBox })

    // Pseudo-code implementation for the hackathon scaffold
    // const faceDetections = blazefaceModel.runSync([frameData]);
    // if (faceDetections.length > 0) {
    //   const embedding = mobilefacenetModel.runSync([croppedFaceData]);
    //   runOnJS(processDetectionResult)({ embedding: embedding[0], success: true });
    // }

  }, [blazefaceModel, mobilefacenetModel]);

  return {
    frameProcessor,
    setIsProcessing: (val: boolean) => { isProcessingRef.current = val; }
  };
};
