import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameBoard } from '../models/game-board';
import { GameCreationRequest } from '../models/game-creation-request';
import { environment } from '../../environments/environment'; // ADD THIS LINE

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = environment.apiUrl; // CHANGE THIS LINE to use environment.apiUrl

  constructor(private http: HttpClient) { }

  createGame(request: GameCreationRequest): Observable<GameBoard> {
    return this.http.post<GameBoard>(`${this.apiUrl}/create`, request);
  }

  getGame(gameId: string): Observable<GameBoard> {
    return this.http.get<GameBoard>(`${this.apiUrl}/${gameId}`);
  }

  revealCell(gameId: string, row: number, col: number): Observable<GameBoard> {
    return this.http.post<GameBoard>(`${this.apiUrl}/${gameId}/reveal/${row}/${col}`, {});
  }

  flagCell(gameId: string, row: number, col: number): Observable<GameBoard> {
    return this.http.post<GameBoard>(`${this.apiUrl}/${gameId}/flag/${row}/${col}`, {});
  }

  chordClick(gameId: string, row: number, col: number): Observable<GameBoard> {
    return this.http.post<GameBoard>(`${this.apiUrl}/${gameId}/chord/${row}/${col}`, {});
  }
}
