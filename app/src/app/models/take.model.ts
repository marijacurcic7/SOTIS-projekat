import firebase from 'firebase/compat/app';

export interface Take {
  id? : string;
  passed: boolean,
  points: number,
  testName: string,
  testId: string,
  startTime: firebase.firestore.Timestamp,
  endTime?: firebase.firestore.Timestamp,
  user: {
    displayName: string,
    uid: string,
  }
}