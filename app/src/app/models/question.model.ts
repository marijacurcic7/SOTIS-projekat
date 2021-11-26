import { DomainProblem } from "./domainProblem.model";

export interface Question {
  id?: string,
  text: string,
  domainProblemId?: string,
  domainProblemName?: string,
  maxPoints: number,
  possibleAnswers: string[]
}