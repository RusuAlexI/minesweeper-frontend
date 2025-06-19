// minesweeper-game-angular/src/app/models/game-board.ts
import { Difficulty } from './difficulty';
export interface Cell {
  row: number;
  col: number;
  mine: boolean;
  revealed: boolean;   // <-- MUST BE 'revealed', NOT 'isRevealed'
  flagged: boolean;    // <-- MUST BE 'flagged', NOT 'isFlagged'
  adjacentMines: number;
}

export interface GameBoard {
  gameId: string; // Correct property name as per backend
  rows: number;
  cols: number;
  mines: number;
  board: Cell[][]; // Type defined with GameCell
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'WON' | 'LOST'; // Consistent with backend
  difficulty: Difficulty;
  startTime: number;
  timeTaken: number; // For final game time
}
