import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Score } from '../models/score';
import { Difficulty } from '../models/difficulty';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private apiUrl = 'http://localhost:8080/api/game'; // Adjust if your score API is separate

  constructor(private http: HttpClient) { }

  addScore(gameId: string, playerName: string): Observable<Score> {
    return this.http.post<Score>(`${this.apiUrl}/scores/add`, { gameId, playerName });
  }

  getTopScores(difficulty: Difficulty): Observable<Score[]> {
    return this.http.get<Score[]>(`${this.apiUrl}/scores/${difficulty}`);
  }
}
