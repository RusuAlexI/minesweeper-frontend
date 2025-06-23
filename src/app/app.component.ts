import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameBoard } from './models/game-board'; // IMPORTANT: Use game-board.ts
import { BoardComponent } from './board/board.component'; // Assuming you have this
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { GameService } from './services/game.service';
import { Difficulty } from './models/difficulty';
import { GameCreationRequest } from './models/game-creation-request'; // Import new request model
import { ScoreService } from './services/score.service';
import { Score } from './models/Score';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BoardComponent,
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  template: `
    <div class="minesweeper-container">
      <h1>Minesweeper</h1>

      <div class="game-setup">
        <h2>Game Setup</h2>
        <div class="game-mode-selection">
          <label>
            <input type="radio" name="gameMode" value="predefined" [(ngModel)]="gameMode" (change)="setGameMode('predefined')"> Predefined
          </label>
          <label>
            <input type="radio" name="gameMode" value="custom" [(ngModel)]="gameMode" (change)="setGameMode('custom')"> Custom
          </label>
        </div>

        <div *ngIf="gameMode === 'predefined'" class="predefined-settings">
          <label for="difficulty-select">Select Difficulty:</label>
          <select id="difficulty-select" [(ngModel)]="selectedDifficulty">
            <option [ngValue]="DifficultyEnum.EASY">Easy</option>
            <option [ngValue]="DifficultyEnum.MEDIUM">Medium</option>
            <option [ngValue]="DifficultyEnum.HARD">Hard</option>
          </select>
        </div>

        <div *ngIf="gameMode === 'custom'" class="custom-settings">
          <h3>Custom Board Settings</h3>
          <div class="input-group">
            <label for="customRows">Rows:</label>
            <input type="number" id="customRows" [(ngModel)]="customRows" min="5" max="50">
          </div>
          <div class="input-group">
            <label for="customCols">Columns:</label>
            <input type="number" id="customCols" [(ngModel)]="customCols" min="5" max="50">
          </div>
          <div class="input-group">
            <label for="customMines">Mines:</label>
            <input type="number" id="customMines" [(ngModel)]="customMines" min="1">
          </div>
          <p *ngIf="customSettingsError" class="error-message">{{ customSettingsError }}</p>
        </div>

        <button (click)="startNewGame()">Start New Game</button>
      </div>

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
        <h2>High Scores</h2>
        <div class="leaderboard-difficulty-select">
          <label for="leaderboard-difficulty">Filter by Difficulty:</label>
          <select id="leaderboard-difficulty" [(ngModel)]="selectedLeaderboardDifficulty" (change)="loadLeaderboard(selectedLeaderboardDifficulty)">
            <option [ngValue]="DifficultyEnum.EASY">Easy</option>
            <option [ngValue]="DifficultyEnum.MEDIUM">Medium</option>
            <option [ngValue]="DifficultyEnum.HARD">Hard</option>
            <option [ngValue]="DifficultyEnum.CUSTOM">Custom</option>
          </select>
        </div>
        <ul *ngIf="topScores.length > 0">
          <li *ngFor="let score of topScores; let i = index">
            {{ i + 1 }}. {{ score.playerName }} - {{ formatTime(score.timeTaken) }} ({{ score.difficulty }})
          </li>
        </ul>
        <p *ngIf="topScores.length === 0">No scores yet for this difficulty.</p>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  game: GameBoard | null = null;
  selectedDifficulty: Difficulty = Difficulty.EASY;
  DifficultyEnum = Difficulty; // Make enum available in template (renamed to avoid conflict with instance variable)

  elapsedTime: number = 0;
  private timerInterval: any;

  showNameInput: boolean = false;
  playerNameInput: string = '';
  topScores: Score[] = [];
  selectedLeaderboardDifficulty: Difficulty = Difficulty.EASY; // For leaderboard filter

  // New properties for Custom Game Settings
  gameMode: 'predefined' | 'custom' = 'predefined';
  customRows: number | null = null;
  customCols: number | null = null;
  customMines: number | null = null;
  customSettingsError: string | null = null;

  constructor(private gameService: GameService, private scoreService: ScoreService) { }

  ngOnInit(): void {
    this.startNewGame(); // Start default game on init
    this.loadLeaderboard(this.selectedLeaderboardDifficulty); // Load initial high scores
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  setGameMode(mode: 'predefined' | 'custom'): void {
    this.gameMode = mode;
    this.customSettingsError = null; // Clear any previous errors
  }

  startNewGame(): void {
    this.stopTimer();
    this.elapsedTime = 0;
    this.showNameInput = false;
    this.customSettingsError = null; // Clear custom settings errors

    let request: GameCreationRequest;

    if (this.gameMode === 'predefined') {
      request = { difficulty: this.selectedDifficulty };
    } else { // Custom mode
      // Client-side validation for custom inputs
      if (!this.customRows || !this.customCols || !this.customMines) {
        this.customSettingsError = 'All custom dimensions (rows, cols, mines) are required.';
        return;
      }
      if (this.customRows < 5 || this.customCols < 5 || this.customRows > 50 || this.customCols > 50) {
        this.customSettingsError = 'Rows and columns must be between 5 and 50.';
        return;
      }
      const totalCells = this.customRows * this.customCols;
      if (this.customMines < 1 || this.customMines >= totalCells) {
        this.customSettingsError = `Mines must be at least 1 and less than total cells (${totalCells}).`;
        return;
      }
      if (this.customMines > totalCells / 2) {
        this.customSettingsError = 'Too many mines for the given board size (maximum 50% of cells).';
        return;
      }

      request = {
        rows: this.customRows,
        cols: this.customCols,
        mines: this.customMines
      };
    }

    this.gameService.createGame(request).subscribe({
      next: (data) => {
        this.game = data;
        console.log('AppComponent: New game started, game state:', this.game);
        if (this.game.status === 'IN_PROGRESS') {
          this.startTimer();
        }
      },
      error: (err) => {
        console.error('AppComponent: Error starting game:', err);
        this.customSettingsError = `Failed to start game: ${err.error.message || 'Unknown error'}`; // Display backend error message
      }
    });
  }

  handleClick(row: number, col: number): void {
    console.log('APP_COMPONENT: Board cell clicked event received:', event);

    if (!this.game || !this.game.gameId) {
      console.error('APP_COMPONENT: Cannot reveal cell, game is not active or has no ID.');
      return;
    }

    this.gameService.revealCell(this.game.gameId, row, col).subscribe({
      next: (updatedGame) => {
        console.log('APP_COMPONENT: Cell revealed successfully. Updated game:', updatedGame);
        this.game = updatedGame; // Update the game state in app.component
        // You might want to check game.status here to see if it changed to 'IN_PROGRESS', 'WON', or 'LOST'
        if (this.game.status === 'WON') {
          console.log('Game WON!');
          this.showNameInput = true; // Show input to save score
        } else if (this.game.status === 'LOST') {
          console.log('Game LOST!');
          // Potentially show game over message
        }
      },
      error: (err) => {
        console.error('APP_COMPONENT: Error revealing cell:', err);
        // Handle error, e.g., show an alert to the user
      }
    });
  }

  handleRightClick(row: number, col: number): void {
    if (!this.game || this.game.status !== 'IN_PROGRESS' || this.game.board[row][col].revealed) {
      return;
    }

    this.gameService.flagCell(this.game.gameId, row, col).subscribe({
      next: (data) => {
        this.game = data;
      },
      error: (err) => { console.error('AppComponent: Error flagging cell:', err); }
    });
  }

  handleChordClick(row: number, col: number): void {
    if (!this.game || this.game.status !== 'IN_PROGRESS' || !this.game.board[row][col].revealed) {
      return;
    }

    this.gameService.chordClick(this.game.gameId, row, col).subscribe({
      next: (data) => {
        this.game = data;
        this.checkGameEnd();
      },
      error: (err) => {
        console.error('AppComponent: Error during chord click:', err);
      }
    });
  }

  private startTimer(): void {
    if (this.game && this.game.status === 'IN_PROGRESS') {
      this.timerInterval = setInterval(() => {
        this.elapsedTime = Date.now() - this.game!.startTime;
      }, 1000);
    }
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private checkGameEnd(): void {
    if (this.game && this.game.status === 'WON') {
      this.stopTimer();
      console.log(`Game Won! Time Taken: ${this.game.timeTaken}ms`);
      this.showNameInput = true;
      this.playerNameInput = ''; // Clear previous name input
    } else if (this.game && this.game.status === 'LOST') {
      this.stopTimer();
      console.log(`Game Over!`);
    }
  }

  submitScore(): void {
    if (!this.game || this.game.status !== 'WON' || !this.game.gameId) {
      console.error('Cannot submit score: game not won or ID missing.');
      return;
    }

    const playerName = this.playerNameInput.trim() || 'Anonymous';

    this.scoreService.addScore(this.game.gameId, playerName).subscribe({
      next: (response) => {
        console.log('Score submission response:', response);
        this.showNameInput = false;
        this.playerNameInput = '';
        this.loadLeaderboard(this.game!.difficulty); // Load scores for the game's difficulty
      },
      error: (err) => {
        console.error('Error submitting score:', err);
        this.showNameInput = false;
        this.playerNameInput = '';
      }
    });
  }

  cancelScoreInput(): void {
    this.showNameInput = false;
    this.playerNameInput = '';
  }

  loadLeaderboard(difficulty: Difficulty): void {
    this.scoreService.getTopScores(difficulty).subscribe({
      next: (scores) => {
        this.topScores = scores;
        console.log(`High scores for ${difficulty}:`, this.topScores);
      },
      error: (err) => {
        console.error('Error fetching high scores:', err);
        this.topScores = [];
      }
    });
  }

  formatTime(ms: number | undefined): string {
    if (ms === undefined || ms === null) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
