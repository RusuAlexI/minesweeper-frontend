import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core'; // Added OnDestroy
import { CommonModule } from '@angular/common';
import { GameBoard } from '../models/game'; // Adjust path as necessary

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnDestroy { // Implement OnDestroy
  @Input() game!: GameBoard;
  @Output() cellChordClicked = new EventEmitter<{row: number, col: number}>();
  @Output() cellClicked = new EventEmitter<{row: number, col: number}>();
  @Output() cellFlagged = new EventEmitter<{row: number, col: number}>();

  // New properties to track mouse button state for each cell
  // Using an object where keys are "row-col" strings
  private activeLeftClicks: { [key: string]: boolean } = {};
  private activeRightClicks: { [key: string]: boolean } = {};
  // New flag to prevent normal clicks if a chord click was just handled
  private chordClickDetectedForCell: { [key: string]: boolean } = {};

  // Helper to create a unique key for cell coordinates
  private getCellKey(row: number, col: number): string {
    return `${row}-${col}`;
  }

  // --- MOUSE DOWN EVENT ---
  onMouseDown(event: MouseEvent, row: number, col: number): void {
    const key = this.getCellKey(row, col);

    // Reset the "chord detected" flag for this interaction
    this.chordClickDetectedForCell[key] = false;

    if (event.button === 0) { // Left mouse button
      this.activeLeftClicks[key] = true;
    } else if (event.button === 2) { // Right mouse button
      this.activeRightClicks[key] = true;
      event.preventDefault(); // IMPORTANT: Prevent context menu immediately on right-mousedown
    }

    // Check if both buttons are now down for this cell
    if (this.activeLeftClicks[key] && this.activeRightClicks[key]) {
      // Trigger chord click if conditions are met
      if (this.game && this.game.status === 'IN_PROGRESS' && this.game.board[row][col].isRevealed) {
        console.log('BOARD_COMPONENT: Simultaneous click detected, triggering chord click for', row, col);
        this.cellChordClicked.emit({row, col});
        this.chordClickDetectedForCell[key] = true; // Mark that a chord click was handled
      } else {
        console.log('BOARD_COMPONENT: Simultaneous click detected, but conditions not met for chord click.', this.game?.board[row][col]);
      }
    }
  }

  // --- MOUSE UP EVENT ---
  onMouseUp(event: MouseEvent, row: number, col: number): void {
    const key = this.getCellKey(row, col);

    // Release the specific button
    if (event.button === 0) { // Left mouse button
      this.activeLeftClicks[key] = false;
    } else if (event.button === 2) { // Right mouse button
      this.activeRightClicks[key] = false;
    }

    // After mouse up, clear the state for this cell if both buttons are released
    if (!this.activeLeftClicks[key] && !this.activeRightClicks[key]) {
      delete this.activeLeftClicks[key];
      delete this.activeRightClicks[key];
      // Keep chordClickDetectedForCell[key] true briefly until (click)/(contextmenu) fire
    }
  }

  // --- STANDARD LEFT CLICK (triggered by (click) event) ---
  onCellClick(row: number, col: number): void {
    const key = this.getCellKey(row, col);
    // If a chord click was just detected for this cell, prevent the normal left click
    if (this.chordClickDetectedForCell[key]) {
      console.log('BOARD_COMPONENT: Suppressing normal left click due to chord click.');
      delete this.chordClickDetectedForCell[key]; // Clear the flag after handling
      return;
    }

    if (!this.game || this.game.status !== 'IN_PROGRESS' || this.game.board[row][col].isRevealed || this.game.board[row][col].isFlagged) {
      console.log('BOARD_COMPONENT: Click ignored due to game state or cell state.');
      return;
    }
    this.cellClicked.emit({row, col});
  }

  // --- RIGHT CLICK (triggered by (contextmenu) event) ---
  onCellRightClick(event: MouseEvent, row: number, col: number): void {
    event.preventDefault(); // IMPORTANT: Always prevent browser context menu
    const key = this.getCellKey(row, col);

    // If a chord click was just detected for this cell, prevent the flag action
    if (this.chordClickDetectedForCell[key]) {
      console.log('BOARD_COMPONENT: Suppressing flag action due to chord click.');
      delete this.chordClickDetectedForCell[key]; // Clear the flag after handling
      return;
    }

    console.log('BOARD_COMPONENT: Contextmenu event for cell', row, col);

    if (!this.game || this.game.status !== 'IN_PROGRESS') {
      console.log('BOARD_COMPONENT: Contextmenu ignored: game not in progress.');
      return;
    }

    // Only allow flagging on unrevealed cells
    if (!this.game.board[row][col].isRevealed) {
      console.log('BOARD_COMPONENT: Emitting flag/unflag for unrevealed cell', row, col);
      this.cellFlagged.emit({row, col});
    } else {
      console.log('BOARD_COMPONENT: Right-click on revealed cell, not flagging (no chord triggered).');
      // If it's a right click on a revealed cell and no chord was triggered, do nothing (standard Minesweeper behavior)
    }
  }

  // Clean up all active clicks state when the component is destroyed
  ngOnDestroy(): void {
    this.activeLeftClicks = {};
    this.activeRightClicks = {};
    this.chordClickDetectedForCell = {};
  }
}
