// models/game.ts

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
  status: 'IN_PROGRESS' | 'COMPLETED' | 'GAME_OVER'; // Example statuses
  startTime: number;
  board: GameCell[][]; // <--- CRUCIAL: Ensure this is typed as GameCell[][]
}
