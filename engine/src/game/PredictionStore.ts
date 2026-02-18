import { logger } from "../utils/logger.js";

const predictionLogger = logger.child("Predictions");

export interface Prediction {
  spectatorId: string;
  spectatorAddress?: string;
  predictedSaboteur: string; // player address
  round: number;
  timestamp: number;
}

export interface PredictionResult extends Prediction {
  correct: boolean;
  points: number;
}

// gameId → Map<spectatorId, Prediction>
const predictions = new Map<string, Map<string, Prediction>>();

export function submitPrediction(
  gameId: string,
  spectatorId: string,
  predictedSaboteur: string,
  round: number,
  spectatorAddress?: string
): Prediction {
  if (!predictions.has(gameId)) {
    predictions.set(gameId, new Map());
  }
  const gamePredictions = predictions.get(gameId)!;

  const prediction: Prediction = {
    spectatorId,
    spectatorAddress,
    predictedSaboteur,
    round,
    timestamp: Date.now(),
  };

  gamePredictions.set(spectatorId, prediction);
  predictionLogger.info(`Prediction for game ${gameId}: ${spectatorId} → ${predictedSaboteur} (round ${round})`);

  return prediction;
}

export function getPredictions(gameId: string): Prediction[] {
  const gamePredictions = predictions.get(gameId);
  if (!gamePredictions) return [];
  return Array.from(gamePredictions.values());
}

export function getPredictionCount(gameId: string): number {
  return predictions.get(gameId)?.size ?? 0;
}

export function resolvePredictions(
  gameId: string,
  saboteurAddress: string
): PredictionResult[] {
  const gamePredictions = predictions.get(gameId);
  if (!gamePredictions) return [];

  const results: PredictionResult[] = [];

  for (const prediction of gamePredictions.values()) {
    const correct = prediction.predictedSaboteur.toLowerCase() === saboteurAddress.toLowerCase();
    // Earlier predictions get more points
    let points = 0;
    if (correct) {
      if (prediction.round <= 1) points = 30;
      else if (prediction.round <= 2) points = 20;
      else points = 10;
    }

    results.push({ ...prediction, correct, points });
  }

  // Sort by points desc, then timestamp asc (earlier predictions first)
  results.sort((a, b) => b.points - a.points || a.timestamp - b.timestamp);

  return results;
}

export function clearPredictions(gameId: string): void {
  predictions.delete(gameId);
}
