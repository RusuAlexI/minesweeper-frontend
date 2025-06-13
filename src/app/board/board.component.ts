import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule if BoardComponent's template uses *ngIf, *ngFor, etc.
import { GameBoard } from '../models/game'; // Adjust path as necessary, and ensure GameBoard is accessible

@Component({
  selector: 'app-board',
  standalone: true, // MUST BE HERE
  imports: [CommonModule], // Include CommonModule if its own template uses *ngIf, *ngFor, etc.
  templateUrl: './board.component.html', // Or inline template
  styleUrls: ['./board.component.css'] // Or inline styles
})
export class BoardComponent {
  @Input() game!: GameBoard; // Using '!' for definite assignment, or provide a default value


  // Emit events back to parent (AppComponent) when a cell is clicked
  @Output() cellClicked = new EventEmitter<{row: number, col: number}>();
  @Output() cellFlagged = new EventEmitter<{row: number, col: number}>();

  handleClick(row: number, col: number): void {
    this.game.board[row][col].isRevealed = true;
  }

  onCellClick(row: number, col: number): void {
    if (!this.game || this.game.status !== 'IN_PROGRESS' || this.game.board[row][col].isRevealed || this.game.board[row][col].isFlagged) {
      console.log('APP_COMPONENT: (3a) handleClick guard activated.'); // Add this
      return;
    }
    this.cellClicked.emit({row, col});
  }

  onCellRightClick(event: MouseEvent, row: number, col: number): void {
    console.log('APP_COMPONENT: (4) handleRightClick called for cell', row, col); // Add this
    if (!this.game || this.game.status !== 'IN_PROGRESS' || this.game.board[row][col].isRevealed) {
      console.log('APP_COMPONENT: (4a) handleRightClick guard activated.'); // Add this
      return;
    }
    console.log('BOARD_COMPONENT: (2) Right-click event received by button at', row, col); // Add this
    event.preventDefault(); // Prevent browser context menu
    this.cellFlagged.emit({row, col});
  }
}
