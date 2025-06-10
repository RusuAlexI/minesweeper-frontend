import { Component } from '@angular/core';
import { GameBoard } from './models/game';
import { BoardComponent } from './board/board.component'; // Assuming BoardComponent is also standalone
import { CommonModule } from '@angular/common'; // <--- THIS IS THE KEY IMPORT FOR *ngIf and *ngFor

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BoardComponent,
    CommonModule // <--- Add CommonModule here
  ],
  template: `
    <h1>Demo1</h1>
    <app-board [game]="game"></app-board>
    <div *ngIf="game">
      <div *ngFor="let row of game.board; let i = index" class="row">
        <button *ngFor="let cell of row; let j = index"
                (click)="handleClick(i, j)">
          {{ cell.isRevealed ? (cell.adjacentMines || '💣') : '' }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  game: GameBoard = {
    id: '1',
    rows: 2, cols: 2, mines: 0,
    status: 'IN_PROGRESS',
    startTime: Date.now(),
    board: [
      [{ isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 },
        { isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }],
      [{ isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 },
        { isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }]
    ]
  };

  handleClick(row: number, col: number): void {
    this.game.board[row][col].isRevealed = true;
  }
}
