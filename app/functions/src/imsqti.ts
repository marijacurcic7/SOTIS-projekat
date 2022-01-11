import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { User } from "./models/user.model";
import { Test } from "./models/test.model";
import { AssessmentItem } from "./models/qti/assessment-item.model";
import { AssessmentTest } from "./models/qti/assessment-test.model";
import { Manifest } from "./models/qti/manifest.model";
import { Question } from "./models/question.model";
import { Answer } from "./models/answer.model";

export const generateImsqti = functions.https.onCall(async (testId: string, context) => {
  // check if teacher is signed in
  if (!context.auth) return;
  const userId = context.auth.uid
  const user: User = (await admin.firestore().doc(`users/${userId}`).get()).data() as User
  if (user.role != 'teacher') throw new functions.https.HttpsError('permission-denied', 'not signed in as teacher')

  // fetch test
  const test: Test = (await admin.firestore()
    .doc(`tests/${testId}`)
    .get())
    .data() as Test
  test.id = testId

  return 'done'
})

export const testStorage = functions.https.onRequest(async (request, response) => {
  const bucket = admin.storage().bucket()
  await bucket.file('asdf.txt').save('evo nekog texta.')
  response.send('finished')
})


// TODO: delte dummy variables
const xmlAssessmentItem = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item>
<the-item-content>Coming soon</the-item-content>
</qti-assessment-item>`
const xmlAssessmentItems = [xmlAssessmentItem]

const xmlTest = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test>
  <the-test-content>Coming soon</the-test-content>
</qti-assessment-test>`

const xmlManifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest>
  <the-manifest-content>Coming soon</the-manifest-content>
</manifest>`


export const saveQti = functions.https.onRequest(async (request, response) => {
  // get necessary files. TODO: replace dummy files with actual xml files

  // zip files
  // create a folder for a specific test
  const JSZip = await import('jszip')
  const zip = new JSZip()

  const testId = 'test12345'
  const folderName = `qti-${testId}`

  const testFolder = zip.folder(folderName)
  // add questions to the folder
  xmlAssessmentItems.forEach((item, i) => {
    testFolder?.file(`item${i}.xml`, item)
  })
  // add test to the folder
  testFolder?.file(`test.xml`, xmlTest)
  // add manifest to the folder
  testFolder?.file('manifest.xml', xmlManifest)

  // create buffer for storage
  const testBuffer = await zip.generateAsync({ type: 'nodebuffer' })

  // save zip to storage
  const bucket = admin.storage().bucket()
  const zippedTest = bucket.file(`qti-${testId}.zip`)
  await zippedTest.save(testBuffer)

  // save zip reference as a field in the test in firestore
  console.log(zippedTest.name)
  console.log(zippedTest.publicUrl())
  // TODO: must add actual id, not dummy id
  // await admin.firestore().doc(`tests/${testId}`).update({'qtiReference':zippedTest.name})

  response.send('done')
})







/**
 * ----------------------------------------------------------------------------
 * -------------------------- TODO: FINISH FUNCTIONS --------------------------
 * ---------------------------------------------------------------------------- 
 */

const testId = 'TpBxQo8I8h0b8NZ8SkCY'

async function getQuestions(testId: string) {
  const questions: Question[] = (await admin.firestore()
    .collection(`tests/${testId}/questions`)
    .get())
    .docs
    .map(question => question.data() as Question)
  return questions
}
async function getCorrectAnswers(testId: string) {
  const correctAnswers: Answer[] = (await admin.firestore()
    .collection(`tests/${testId}/answers`)
    .get())
    .docs
    .map(ans => ans.data() as Answer)
  return correctAnswers
}


// endpoint: http://localhost:8082/e-learning-b157f/us-central1/getAssessmentItemXml
export const getAssessmentItemXml = functions.https.onRequest(async (request, response) => {
  // get questions
  const questions = await getQuestions(testId)
  const correctAnswers = await getCorrectAnswers(testId)

  // TODO: proslediti u konstruktoru prave parametre
  const assessmentItem = new AssessmentItem()
  console.log(assessmentItem.getXml())
  response.contentType('text/xml; charset=utf8').send(assessmentItem.getXml())
})

export const getTestXml = functions.https.onRequest(async (request, response) => {
  // get test from database
  const javascriptTest: Test = (await admin.firestore().doc(`tests/TpBxQo8I8h0b8NZ8SkCY`).get()).data() as Test

  // TODO: proslediti u konstruktoru prave parametre
  // const test = new AssessmentTest()
  // console.log(test.getXml())
  // response.contentType('text/xml; charset=utf8').send(test.getXml())
})

export const getManifestXml = functions.https.onRequest(async (request, response) => {
  // TODO: proslediti u konstruktoru prave parametre
  // const manifest = new Manifest()
  // console.log(manifest.getXml())
  // response.contentType('text/xml; charset=utf8').send(manifest.getXml())
})