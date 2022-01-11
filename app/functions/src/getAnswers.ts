import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { User } from "./models/user.model";
import { Answer } from "./models/answer.model";

export const getCorrectAnswers = functions.https.onCall(async (takeId: string, context) => {
  // check if student is signed in
  if (!context.auth) return;
  const userId = context.auth.uid
  const user: User = (await admin.firestore().doc(`users/${userId}`).get()).data() as User
  if (user.role != 'student') throw new functions.https.HttpsError('permission-denied', 'not signed in as student')

  // check if user has finished take. Take is finished if endTime exists
  const endTime = (await admin.firestore()
    .doc(`users/${userId}/takes/${takeId}`)
    .get())
    .get('endTime')

  if (!endTime) throw new functions.https.HttpsError('aborted', 'You must finish take before reading correct answers')

  // if user has finished take, return correct answers
  const testId: string = (await admin.firestore()
    .doc(`users/${userId}/takes/${takeId}`)
    .get())
    .get('testId')


  const correctAnswers: Answer[] = (await admin.firestore()
    .collection(`tests/${testId}/answers`)
    .get())
    .docs
    .map(ans => ans.data() as Answer)

  return correctAnswers
})