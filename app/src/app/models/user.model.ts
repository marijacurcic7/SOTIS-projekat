import { Take } from "./take.model";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string,
  createdTests?: string[], // if teacher
  takes?: Take[] // if student
}