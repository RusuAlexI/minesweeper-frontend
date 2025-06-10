import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameBoard } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = 'https://your-heroku-backend.herokuapp.com/api/game'; // update this later

  constructor(private http: HttpClient) {}

  createGame(rows: number, cols: number, mines: number): Observable<GameBoard> {
    return this.http.post<GameBoard>(this.baseUrl, { rows, cols, mines });
  }

  revealCell(id: string, row: number, col: number): Observable<GameBoard> {
    return this.http.post<GameBoard>(`${this.baseUrl}/${id}/reveal`, { row, col });
  }

  flagCell(id: string, row: number, col: number): Observable<GameBoard> {
    return this.http.post<GameBoard>(`${this.baseUrl}/${id}/flag`, { row, col });
  }

  getGame(id: string): Observable<GameBoard> {
    return this.http.get<GameBoard>(`${this.baseUrl}/${id}`);
  }
}
