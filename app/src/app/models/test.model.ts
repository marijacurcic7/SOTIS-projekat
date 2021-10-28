import { Answer } from "./answer.model";
import { Question } from "./question.model";

export interface Test {
  name: string,
  topic: string,
  maxPoints: number,
  questions: Question[],
  answers: Answer[],
  createdBy: {
    displayName: string,
    teacherId: string
  }
}