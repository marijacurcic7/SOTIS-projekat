import * as functions from 'firebase-functions'
import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import { inspect } from 'util'
import { PubSubData } from './models/pubSubData.model'


const billing = google.cloudbilling('v1').projects
const PROJECT_ID = process.env.GCLOUD_PROJECT;
const PROJECT_NAME = `projects/${PROJECT_ID}`;
const KILL_PROJECT_LIMIT_AMOUNT = 2; // if amount is over 2$, disable billing


export const getBillingInfo = functions.https.onRequest(async (req, res) => {
  setCredentialsForBilling()
  const billingInfo = await billing.getBillingInfo({ name: PROJECT_NAME })
  console.log('Here is my billing: \n---------\n')
  console.log(inspect(billingInfo))
  res.sendStatus(200)
})

function setCredentialsForBilling() {
  const client = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/cloud-billing',
      'https://www.googleapis.com/auth/cloud-platform',
    ],
  });

  google.options({
    auth: client
  })
}

async function disableBillingForReal() {
  setCredentialsForBilling()
  const billingInfo = await billing.getBillingInfo({ name: PROJECT_NAME })
  if (billingInfo.data.billingEnabled) {
    const res = await billing.updateBillingInfo({
      name: PROJECT_NAME,
      requestBody: { billingAccountName: '' }
    })
    console.log('BILLING DISABLED STATUS:', res.status);
    return res;
  }
  else {
    console.log('Billing is already disabled.')
    return;
  }
}

/**
 * handleBudgetAlert function will be called when my-budget-alert topic is sent.
 * This is defined in GCP.
 * This function will check if KILL_PROJECT_LIMIT_AMOUNT is exceeded.
 * If so, firebase plan will be downgraded from 'pay as you go' to 'free' plan.
 * If not, nothing will happen. 
 */
export const handleBudgetAlert = functions.pubsub.topic('my-budget-alert').onPublish(async message => {
  try {
    const data = message.json as PubSubData;
    const amountSpentSoFar = data.costAmount;
    if (amountSpentSoFar >= KILL_PROJECT_LIMIT_AMOUNT) {
      await disableBillingForReal()
      console.log('BILLING IS DISABLED. CHANGED TO SPARK PLAN.')

    }
  } catch (error) {
    console.error('AN ERROR OCCURED WHILE DISABLING BILLING.')
  }
  return null;
})


// curl http://localhost:5001/cultural-heritage-c8349/us-central1/mockPubSubBilling
export const mockPubSubBilling = functions.https.onRequest(async (req, res) => {
  // use only when testing locally
  const isEmulated = process.env.FUNCTIONS_EMULATOR;
  if (!isEmulated) return;

  const pubsub = await import('@google-cloud/pubsub')
  const mypubsub = new pubsub.PubSub()

  // change constAmount to be higher then KILL_PROJECT_LIMIT_AMOUNT
  // in order to disable billing
  const msg = await mypubsub.topic('my-budget-alert').publishJSON({
    "budgetDisplayName": "name-of-budget",
    "alertThresholdExceeded": 1.0,
    "costAmount": 0.01,
    "costIntervalStart": "2019-01-01T00:00:00Z",
    "budgetAmount": 100.00,
    "budgetAmountType": "SPECIFIED_AMOUNT",
    "currencyCode": "USD"
  })

  res.send({ published: msg })
})
