import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Score } from '../models/Score';
import { Difficulty } from '../models/difficulty';
import { environment } from '../../environments/environment'; // ADD THIS LINE

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private apiUrl = environment.apiUrl; // CHANGE THIS LINE to use environment.apiUrl

  constructor(private http: HttpClient) { }

  addScore(gameId: string, playerName: string): Observable<Score> {
    return this.http.post<Score>(`${this.apiUrl}/scores/add`, { gameId, playerName });
  }

  getTopScores(difficulty: Difficulty): Observable<Score[]> {
    return this.http.get<Score[]>(`${this.apiUrl}/scores/${difficulty}`);
  }
}
