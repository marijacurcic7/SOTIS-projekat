import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { User } from "./models/user.model";
import { Test } from "./models/test.model";
import {parse} from 'js2xmlparser'

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


  return getImsQti(test)
})

function getImsQti(test:Test) {
  console.log(test)
}

export const testQti = functions.https.onRequest(async (request, response) => {
  const assessmentItem = {
    '@' : {
      'xmlns' : 'http://www.imsglobal.org/xsd/imsqti_v2p0',
      'xsi:schemaLocation': "http://www.imsglobal.org/xsd/imsqti_v2p2  http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2p2.xsd",
      'identifier': 'test1234',
      'title': 'Composition of Water',
    }, 
    'responseDeclaration' : {
      '@' : {
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