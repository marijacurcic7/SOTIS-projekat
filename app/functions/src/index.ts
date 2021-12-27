import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
admin.initializeApp();
import { Answer } from "./models/answer.model";
import { Question } from "./models/question.model";
import { MyAnswer } from "./models/myAnswer.model";
import { User } from "./models/user.model";


export const finishTake = functions.https.onCall(async (takeId: string, context) => {
  // check if student is signed in
  if (!context.auth) return;
  const userId = context.auth.uid
  const user: User = (await admin.firestore().doc(`users/${userId}`).get()).data() as User
  if (user.role != 'student') throw new functions.https.HttpsError('permission-denied', 'not signed in as student')

  // get all data needed for the function
  let totalPoints = 0
  let maxTestPoints = 0

  const testId: string = (await admin.firestore()
    .doc(`users/${userId}/takes/${takeId}`)
    .get())
    .get('testId')

  const questions: Question[] = (await admin.firestore()
    .collection(`tests/${testId}/questions`)
    .get())
    .docs
    .map(question => question.data() as Question)

  const correctAnswers: Answer[] = (await admin.firestore()
    .collection(`tests/${testId}/answers`)
    .get())
    .docs
    .map(ans => ans.data() as Answer)

  const myAnswers: MyAnswer[] = (await admin.firestore()
    .collection(`users/${userId}/takes/${takeId}/myAnswers`)
    .get())
    .docs
    .map(ans => ans.data() as MyAnswer)

  // actual logic
  // iterate over my answers and check which one is correct. Update my answers in db
  correctAnswers.forEach(async (correctAnswer, index) => {
    const correctAnswersForAQuestion = correctAnswer.correctAnswers.sort();

    if (!myAnswers[index]) return;
    const myAnswersForAQuestion = myAnswers[index].myAnswers.sort();
    const maxPoints = questions[Number(myAnswers[index].id)].maxPoints;
    const isEveryAnswerForAQuestionCorrect = correctAnswersForAQuestion.every((ans, i) => ans === myAnswersForAQuestion[i]);
    if (isEveryAnswerForAQuestionCorrect) {
      totalPoints += maxPoints;
      myAnswers[index].points = maxPoints;
      myAnswers[index].correct = true;
    }
    else {
      myAnswers[index].points = 0;
      myAnswers[index].correct = false;
    }
    maxTestPoints += maxPoints;

    // update my answer
    await admin.firestore().doc(`users/${userId}/takes/${takeId}/myAnswers/${String(index)}`).set(myAnswers[index])
  });

  // update take based on correct answers
  return await admin.firestore().doc(`users/${userId}/takes/${takeId}`).update({
    endTime: admin.firestore.FieldValue.serverTimestamp(),
    points: totalPoints,
    passed: totalPoints / maxTestPoints >= 0.5,
    user: {
      displayName: user.displayName,
      uid: user.uid
    }
  })
})