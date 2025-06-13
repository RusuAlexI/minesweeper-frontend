import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameBoard } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = 'https://your-heroku-backend.herokuapp.com/api/game'; // update this later
  private apiUrl = 'http://localhost:8080/api/game'; // Adjust this to your backend URL and base path

  constructor(private http: HttpClient) {}

  createGame(rows: number, cols: number, mines: number): Observable<GameBoard> {
    return this.http.post<GameBoard>(this.apiUrl, { rows, cols, mines });
  }

  revealCell(id: string, row: number, col: number): Observable<GameBoard> {
    return this.http.post<GameBoard>(`${this.apiUrl}/${id}/reveal`, { row, col });
  }

  flagCell(id: string, row: number, col: number): Observable<GameBoard> {
    return this.http.post<GameBoard>(`${this.apiUrl}/${id}/flag`, { row, col });
  }

  getGame(id: string): Observable<GameBoard> {
    return this.http.get<GameBoard>(`${this.apiUrl}/${id}`);
  }

  // Method to start a new game
  startGame(rows: number, cols: number, mines: number): Observable<GameBoard> {
    // Assuming your backend has an endpoint like POST /api/game/start
    return this.http.post<GameBoard>(`${this.apiUrl}/start`, { rows, cols, mines });
  }

}
