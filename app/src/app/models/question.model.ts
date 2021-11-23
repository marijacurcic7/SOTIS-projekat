import { DomainProblem } from "./domainProblem.model";

export interface Question {
  id?: string,
  text: string,
  domainProblem?: DomainProblem,
  maxPoints: number,
  possibleAnswers: string[]
}