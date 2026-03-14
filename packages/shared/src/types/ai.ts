import { Architecture } from './architecture';

export interface AISuggestRequest {
  description: string;
  constraints?: string;
  existingArchitecture?: Architecture;
}

export interface AISuggestResponse {
  architecture: Architecture;
  explanation: string;
  scalingStrategy: {
    recommendations: string[];
    estimatedCapacity: string;
  };
  warnings: string[];
}
