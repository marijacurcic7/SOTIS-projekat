import { Answer } from "./answer.model";
import { Domain } from "./domain.model";
import { Question } from "./question.model";

export interface Test {
  id?: string,
  name: string,
  domainId?: string,
  domainName?: string,
  maxPoints: number,
  createdBy: {
    displayName: string,
    teacherId: string
  }
}