import firebase from 'firebase/compat/app';

export interface Take {
  passed: boolean,
  points: number,
  testName: string,
  testId: string,
  startTime: firebase.firestore.Timestamp,
  endTime?: firebase.firestore.Timestamp,
}