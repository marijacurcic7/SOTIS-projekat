import { Take } from "./take.model";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'teacher' | 'student' | 'admin',
}