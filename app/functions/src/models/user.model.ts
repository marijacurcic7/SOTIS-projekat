export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'teacher' | 'student' | 'admin',
}