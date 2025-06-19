import { Difficulty } from "./difficulty";

export interface GameCreationRequest {
  difficulty?: Difficulty;
  rows?: number;
  cols?: number;
  mines?: number;
}
