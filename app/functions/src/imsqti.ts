import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { User } from "./models/user.model";
import { Test } from "./models/test.model";
import { AssessmentItem } from "./models/qti/assessment-item.model";
import { AssessmentTest } from "./models/qti/assessment-test.model";
import { Manifest } from "./models/qti/manifest.model";
import { Question } from "./models/question.model";
import { Answer } from "./models/answer.model";

export const createQti = functions.https.onCall(async (testId: string, context) => {
  // check if teacher is signed in
  if (!context.auth) return;
  const userId = context.auth.uid
  const user: User = (await admin.firestore().doc(`users/${userId}`).get()).data() as User
  if (user.role != 'teacher') throw new functions.https.HttpsError('permission-denied', 'not signed in as teacher')

  // check if file exists 
  const bucket = admin.storage().bucket()
  const zippedTest = bucket.file(`qti-${testId}.zip`)
  const exists = await zippedTest.exists()
  if (exists[0] === true) throw new functions.https.HttpsError('already-exists', 'qti zip already exists.')

  // if zip doesn't exist, create qti zip
  return await createQtiZip(testId, userId)
})


async function getQuestions(testId: string) {
  const questions: Question[] = (await admin.firestore()
    .collection(`tests/${testId}/questions`)
    .get())
    .docs
    .map(question => { return { ...question.data(), id: question.id } as Question })
  return questions
}
async function getCorrectAnswers(testId: string) {
  const correctAnswers: Answer[] = (await admin.firestore()
    .collection(`tests/${testId}/answers`)
    .get())
    .docs
    .map(ans => { return { ...ans.data(), id: ans.id } as Answer })
  return correctAnswers
}


async function createQtiZip(testId: string, userId: string) {
  const test = (await admin.firestore().doc(`tests/${testId}`).get()).data() as Test
  test.id = testId
  const questions = await getQuestions(testId)
  const correctAnswers = await getCorrectAnswers(testId)

  // create questions
  const assessmentItems: AssessmentItem[] = [];
  for (const question of questions) {
    const answer = correctAnswers.find(ans => { return ans.id == question.id; });
    if (!answer) continue
    const assessmentItem = new AssessmentItem(question, answer);
    assessmentItems.push(assessmentItem);
  }

  // create test
  const assessmentTest = new AssessmentTest(test, assessmentItems);
  // create manifest
  const manifest = new Manifest(assessmentTest, assessmentItems);


  // zip files
  // create a folder for a specific test
  const JSZip = await import('jszip')
  const zip = new JSZip()
  const folderName = `qti-${testId}`
  const qtiFolder = zip.folder(folderName)

  // add questions to the folder
  const itemsFolder = qtiFolder?.folder('items')
  assessmentItems.forEach(item => itemsFolder?.file(`${item["@"]['identifier']}.xml`, item.getXml()))
  // add test to the folder
  qtiFolder?.file('assessment.xml', assessmentTest.getXml())
  // add manifest to the folder
  qtiFolder?.file('manifest.xml', manifest.getXml())


  // create buffer for storage
  const testBuffer = await zip.generateAsync({ type: 'nodebuffer' })

  // save zip to storage
  const bucket = admin.storage().bucket()
  const zippedTest = bucket.file(`qti-${testId}.zip`)
  await zippedTest.save(testBuffer)
  await zippedTest.setMetadata({ metadata: { 'createdBy': userId } })
}