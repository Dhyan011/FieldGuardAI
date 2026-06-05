import { useEffect, useState } from 'react';
import { useTensorflowModel } from 'react-native-tflite';

// Placeholders for model paths
const BLAZEFACE_MODEL = require('../../assets/models/blazeface.tflite');
const MOBILEFACENET_MODEL = require('../../assets/models/mobilefacenet_int8.tflite');
const ANTISPOOFING_MODEL = require('../../assets/models/antispoofing.tflite');
const FACEMESH_MODEL = require('../../assets/models/mediapipe_face_mesh.tflite');

export const useAIPipeline = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load BlazeFace for detection
  const blazeface = useTensorflowModel(BLAZEFACE_MODEL, 'core-ml'); // Using CoreML on iOS / NNAPI on Android implicitly fallback
  
  // Load MobileFaceNet for embeddings
  const mobilefacenet = useTensorflowModel(MOBILEFACENET_MODEL, 'core-ml');
  
  // Load AntiSpoofing for passive liveness
  const antispoofing = useTensorflowModel(ANTISPOOFING_MODEL, 'core-ml');

  // Load FaceMesh for active liveness (gestures)
  const facemesh = useTensorflowModel(FACEMESH_MODEL, 'core-ml');

  useEffect(() => {
    if (
      blazeface.model &&
      mobilefacenet.model &&
      antispoofing.model &&
      facemesh.model
    ) {
      setModelsLoaded(true);
    }
  }, [
    blazeface.model,
    mobilefacenet.model,
    antispoofing.model,
    facemesh.model,
  ]);

  return {
    modelsLoaded,
    blazefaceModel: blazeface.model,
    mobilefacenetModel: mobilefacenet.model,
    antispoofingModel: antispoofing.model,
    facemeshModel: facemesh.model,
  };
};

/**
 * Utility to calculate cosine similarity between two embeddings
 */
export const cosineSimilarity = (vecA: Float32Array, vecB: Float32Array): number => {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0.0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
