import { Component, OnInit, OnDestroy } from '@angular/core'; // Added OnDestroy
import { GameBoard } from './models/game';
import { BoardComponent } from './board/board.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { GameService } from './services/game.service';
import { Difficulty } from './models/difficulty'; // Import the new Difficulty enum
import { ScoreService } from './services/score.service'; // NEW: Import ScoreService
import { Score } from './models/score'; // NEW: Import Score interface
import { FormsModule } from '@angular/forms'; // NEW: For ngModel binding on input


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BoardComponent,
    CommonModule,
    HttpClientModule,
    FormsModule // NEW: Add FormsModule for two-way binding
  ],
  template: `
    <h1>Minesweeper</h1>
    <div class="difficulty-selection">
      <button (click)="selectDifficulty(Difficulty.EASY)" [class.active]="selectedDifficulty === Difficulty.EASY">Easy</button>
      <button (click)="selectDifficulty(Difficulty.MEDIUM)" [class.active]="selectedDifficulty === Difficulty.MEDIUM">Medium</button>
      <button (click)="selectDifficulty(Difficulty.HARD)" [class.active]="selectedDifficulty === Difficulty.HARD">Hard</button>
    </div>
    <button (click)="startNewGame()">New Game</button>
    <div class="game-info">
      <p *ngIf="game">Difficulty: {{ game.difficulty }}</p>
      <p *ngIf="game?.status === 'IN_PROGRESS'">Time: {{ formatTime(elapsedTime) }}</p>
      <p *ngIf="game?.status === 'WON'">You Won in: {{ formatTime(game!.timeTaken!) }}!</p>
      <p *ngIf="game?.status === 'LOST'">Game Over!</p>
    </div>

    <app-board *ngIf="game"
               [game]="game"
               (cellClicked)="handleClick($event.row, $event.col)"
               (cellFlagged)="handleRightClick($event.row, $event.col)"
               (cellChordClicked)="handleChordClick($event.row, $event.col)">
    </app-board>

    <div *ngIf="showNameInput" class="name-input-overlay">
      <div class="name-input-card">
        <h3>Congratulations! You Won!</h3>
        <p>Your time: {{ formatTime(game!.timeTaken!) }}</p>
        <label for="playerName">Enter your name:</label>
        <input id="playerName" type="text" [(ngModel)]="playerNameInput" maxlength="20" placeholder="Anonymous">
        <button (click)="submitScore()">Save Score</button>
        <button (click)="cancelScoreInput()">No Thanks</button>
      </div>
    </div>

    <div class="high-scores-container">
      <h2>High Scores ({{ selectedDifficulty }})</h2>
      <button (click)="refreshHighScores()">Refresh Scores</button>
      <ul *ngIf="topScores.length > 0">
        <li *ngFor="let score of topScores; let i = index">
          {{ i + 1 }}. {{ score.playerName }} - {{ formatTime(score.timeTaken) }}
        </li>
      </ul>
      <p *ngIf="topScores.length === 0">No scores yet for this difficulty.</p>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy { // Implement OnDestroy

  game: GameBoard | null = null;
  selectedDifficulty: Difficulty = Difficulty.EASY; // Default difficulty
  Difficulty = Difficulty; // Make enum available in template

  elapsedTime: number = 0; // For live timer display
  private timerInterval: any; // To hold the interval reference

  // NEW: For score input
  showNameInput: boolean = false;
  playerNameInput: string = '';
  topScores: Score[] = []; // To store fetched high scores

  constructor(private gameService: GameService, private scoreService: ScoreService) { } // Inject ScoreService

  ngOnInit(): void {
    this.startNewGame(); // Start default game on init
    this.refreshHighScores(); // Load initial high scores
  }

  ngOnDestroy(): void {
    this.stopTimer(); // Clean up timer when component is destroyed
  }

  selectDifficulty(difficulty: Difficulty): void {
    this.selectedDifficulty = difficulty;
    console.log('Selected difficulty:', difficulty);
    this.refreshHighScores(); // Refresh scores for new difficulty
  }

  startNewGame(): void {
    this.stopTimer(); // Stop any existing timer
    this.elapsedTime = 0; // Reset timer
    this.showNameInput = false; // Hide name input if visible

    this.gameService.startGame(this.selectedDifficulty).subscribe({
      next: (data) => {
        this.game = data;
        console.log('AppComponent: New game started, game state:', this.game);
        if (this.game.status === 'IN_PROGRESS') {
          this.startTimer(); // Start timer for new game
        }
      },
      error: (err) => { console.error('AppComponent: Error starting game:', err); }
    });
  }

  handleClick(row: number, col: number): void {
    if (!this.game || this.game.status !== 'IN_PROGRESS' || this.game.board[row][col].isRevealed || this.game.board[row][col].isFlagged) {
      return;
    }

    this.gameService.revealCell(this.game.id, row, col).subscribe({
      next: (data) => {
        this.game = data;
        console.log('AppComponent: Cell revealed, new game state:', this.game);
        this.checkGameEnd(); // Check if game ended after this move
      },
      error: (err) => { console.error('AppComponent: Error revealing cell:', err); }
    });
  }

  handleRightClick(row: number, col: number): void {
    if (!this.game || this.game.status !== 'IN_PROGRESS' || this.game.board[row][col].isRevealed) {
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
    if (!this.game || this.game.status !== 'IN_PROGRESS' || !this.game.board[row][col].isRevealed) {
      return;
    }

    this.gameService.chordClick(this.game.id, row, col).subscribe({
      next: (data) => {
        this.game = data;
        console.log('AppComponent: Chord click successful, new game state:', this.game);
        this.checkGameEnd(); // Check if game ended after this move
      },
      error: (err) => {
        console.error('AppComponent: Error during chord click:', err);
      }
    });
  }

  // --- Timer Logic ---
  private startTimer(): void {
    if (this.game && this.game.status === 'IN_PROGRESS') {
      this.timerInterval = setInterval(() => {
        this.elapsedTime = Date.now() - this.game!.startTime;
      }, 1000); // Update every second
    }
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // --- Game End / Score Logic ---
  private checkGameEnd(): void {
    if (this.game && this.game.status === 'WON') {
      this.stopTimer();
      console.log(`Game Won! Time Taken: ${this.game.timeTaken}ms`);
      this.showNameInput = true; // Show the name input pop-up
    } else if (this.game && this.game.status === 'LOST') {
      this.stopTimer();
      console.log(`Game Over!`);
      // Optionally, start a new game automatically or provide a button
    }
  }

  submitScore(): void {
    if (!this.game || this.game.status !== 'WON' || !this.game.id) {
      console.error('Cannot submit score: game not won or ID missing.');
      return;
    }

    // Trim whitespace from name, default to 'Anonymous' if empty
    const playerName = this.playerNameInput.trim() || 'Anonymous';

    this.scoreService.addScore(this.game.id, playerName).subscribe({
      next: (response) => {
        console.log('Score submission response:', response);
        this.showNameInput = false; // Hide input after submission
        this.playerNameInput = ''; // Clear input
        this.refreshHighScores(); // Refresh the list to see new score
      },
      error: (err) => {
        console.error('Error submitting score:', err);
        this.showNameInput = false; // Hide even on error
        this.playerNameInput = '';
      }
    });
  }

  cancelScoreInput(): void {
    this.showNameInput = false;
    this.playerNameInput = '';
  }

  refreshHighScores(): void {
    this.scoreService.getTopScores(this.selectedDifficulty).subscribe({
      next: (scores) => {
        this.topScores = scores;
        console.log(`High scores for ${this.selectedDifficulty}:`, this.topScores);
      },
      error: (err) => {
        console.error('Error fetching high scores:', err);
        this.topScores = []; // Clear scores on error
      }
    });
  }

  // Helper to format milliseconds into seconds.ms or minutes:seconds
  formatTime(ms: number | undefined): string {
    if (ms === undefined || ms === null) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
