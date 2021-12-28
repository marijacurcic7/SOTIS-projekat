export interface Question {
  id?: string,
  sortedIndex: number,
  text: string,
  domainProblemId?: string,
  domainProblemName?: string,
  maxPoints: number,
  possibleAnswers: string[]
}