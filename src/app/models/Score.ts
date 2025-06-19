// minesweeper-game-angular/src/app/models/score.ts
import { Difficulty } from "./difficulty";

export interface Score {
  id: string;
  gameId: string;
  playerName: string;
  timeTaken: number; // milliseconds
  difficulty: Difficulty;
  timestamp: number; // epoch milliseconds
}
