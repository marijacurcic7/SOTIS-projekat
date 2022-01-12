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