import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { User } from "./models/user.model";
import { Test } from "./models/test.model";
import { parse } from 'js2xmlparser'
import * as JSZip from 'jszip'

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

export const testXml = functions.https.onRequest(async (request, response) => {
  const assessmentItem = {
    '@': {
      'xmlns': 'http://www.imsglobal.org/xsd/imsqti_v2p0',
      'xsi:schemaLocation': "http://www.imsglobal.org/xsd/imsqti_v2p2  http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2p2.xsd",
      'identifier': 'test1234',
      'title': 'Composition of Water',
    },
    'responseDeclaration': {
      '@': {
        'identifier': 'RESPONSE',
        'cardinality': 'multiple',
        'baseType': 'identifier'
      },
      'correctResponse': {
        'value': ['H', 'O'],
      }
    }
  }
  const xml = parse('assessmentItem', assessmentItem)
  console.log(xml)
  // response.contentType('text/xml; charset=utf8').send(xml)
  response.send('hello xml')
})

// function zipFiles(testContent: string,manifestContent: string, questionsContent: string[]) {

//   const zipped = file('testFile.xml', 'some content');
//   zipped.generateAsync
// }
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
  const testId = 'test12345'
  const folderName = `qti-${testId}`
  const zip = new JSZip()
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
  const testBuffer = await zip.generateAsync({type: 'nodebuffer'})

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