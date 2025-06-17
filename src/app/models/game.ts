// models/game.ts
import { Difficulty } from './difficulty'; // Import the new enum


export interface GameCell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

export interface GameBoard {
  id: string;
  rows: number;
  cols: number;
  mines: number;
  // Make sure this matches your Java enum values!
  status: 'IN_PROGRESS' | 'WON' | 'LOST'; // <--- Corrected this line
  difficulty: Difficulty; // ADD THIS
  timeTaken?: number;    // ADD THIS (Optional, for when game ends)
  startTime: number;
  board: GameCell[][]; // <--- CRUCIAL: Ensure this is typed as GameCell[][]
}
