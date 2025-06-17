import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Score } from '../models/score';
import { Difficulty } from '../models/difficulty';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private apiUrl = 'http://localhost:8080/api/scores'; // Matches your backend ScoreController @RequestMapping

  constructor(private http: HttpClient) { }

  /**
   * Sends a request to the backend to add a new score.
   * @param gameId The ID of the completed game.
   * @param playerName The name of the player.
   * @returns An Observable of the added Score (if it made it to top 10) or a response indicating success.
   */
  addScore(gameId: string, playerName: string): Observable<Score | any> {
    return this.http.post<Score>(`${this.apiUrl}/add`, { gameId, playerName });
  }

  /**
   * Retrieves the top scores for a given difficulty.
   * @param difficulty The difficulty level to fetch scores for.
   * @returns An Observable of an array of Score objects.
   */
  getTopScores(difficulty: Difficulty): Observable<Score[]> {
    return this.http.get<Score[]>(`${this.apiUrl}/top/${difficulty}`);
  }
}
