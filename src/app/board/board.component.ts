import { Component, Input } from '@angular/core';
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


  handleClick(row: number, col: number): void {
    this.game.board[row][col].isRevealed = true;
  }
}
