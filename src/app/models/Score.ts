import { Difficulty } from './difficulty'; // Import the Difficulty enum

export interface Score {
  id: string;
  playerName: string;
  timeTaken: number; // in milliseconds
  difficulty: Difficulty;
  timestamp: number; // When the score was recorded (epoch milliseconds)
}
