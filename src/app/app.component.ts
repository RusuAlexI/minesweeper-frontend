import { Component, OnInit } from '@angular/core'; // Import OnInit
import { GameBoard } from './models/game';
import { BoardComponent } from './board/board.component'; // Assuming BoardComponent is also standalone
import { CommonModule } from '@angular/common'; // <--- THIS IS THE KEY IMPORT FOR *ngIf and *ngFor
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { GameService } from './services/game.service'; // Import your new service

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BoardComponent,
    CommonModule, // <--- Add CommonModule here,
    HttpClientModule // Add HttpClientModule here
  ],
  template: `
    <app-board *ngIf="game"
               [game]="game"
               (cellClicked)="handleClick($event.row, $event.col)"
               (cellFlagged)="handleRightClick($event.row, $event.col)"
               (cellChordClicked)="handleChordClick($event.row, $event.col)">  </app-board>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit { // Implement OnInit

  game: GameBoard | null = null; // Initialize as null, will be populated by backend
  constructor(private gameService: GameService) { } // Inject the service

  ngOnInit(): void {
    // Start a default game when the component initializes
    this.startNewGame(8, 8, 10);
  }

  startNewGame(rows: number, cols: number, mines: number): void {
    this.gameService.startGame(rows, cols, mines).subscribe({
      next: (data) => {
        this.game = data;
        console.log('AppComponent: New game started, game state:', this.game); // <--- ADD THIS
      },
      error: (err) => { console.error('AppComponent: Error starting game:', err); }
    });
  }

  handleClick(row: number, col: number): void {
    console.log('AppComponent: Received click event for cell', row, col); // <--- ADD THIS
    if (!this.game || this.game.status !== 'IN_PROGRESS' || this.game.board[row][col].isRevealed || this.game.board[row][col].isFlagged) {
      console.log('AppComponent: Click ignored due to game state or cell state.'); // <--- ADD THIS
      return;
    }

    this.gameService.revealCell(this.game.id, row, col).subscribe({
      next: (data) => {
        this.game = data;
        console.log('AppComponent: Cell revealed, new game state:', this.game); // <--- ADD THIS
      },
      error: (err) => { console.error('AppComponent: Error revealing cell:', err); }
    });
  }

  handleRightClick(row: number, col: number): void { // <--- KEEP IT WITHOUT MouseEvent here
    console.log('AppComponent: Received right-click event for cell', row, col);
    if (!this.game || this.game.status !== 'IN_PROGRESS' || this.game.board[row][col].isRevealed) {
      console.log('AppComponent: Right-click ignored due to game state or cell state.');
      return;
    }

    this.gameService.flagCell(this.game.id, row, col).subscribe({
      next: (data) => {
        this.game = data;
        console.log('AppComponent: Cell flagged/unflagged, new game state:', this.game);
      },
      error: (err) => { console.error('AppComponent: Error flagging cell:', err); }
    });
  }

  handleChordClick(row: number, col: number): void {
    console.log('APP_COMPONENT: Received chord click event for cell', row, col);
    if (!this.game || this.game.status !== 'IN_PROGRESS' || !this.game.board[row][col].isRevealed) {
      console.log('APP_COMPONENT: Chord click ignored due to game state or cell not revealed.');
      return;
    }

    this.gameService.chordClick(this.game.id, row, col).subscribe({ // <--- NEW Service Call
      next: (data) => {
        this.game = data;
        console.log('APP_COMPONENT: Chord click successful, new game state:', this.game);
      },
      error: (err) => {
        console.error('APP_COMPONENT: Error during chord click:', err);
      }
    });
  }

}
