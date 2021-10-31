import { Answer } from "./answer.model";
import { Question } from "./question.model";

export interface Test {
  name: string,
  topic: string,
  maxPoints: number,
  createdBy: {
    displayName: string,
    teacherId: string
  }
}