import * as functions from 'firebase-functions'
import { streamToBigQuery } from './helper'

export const onPaymentWritten = functions
  .runWith({})
  .firestore.database('staging-beta')
  .document(
    'providers/{providerId}/residents/{residentId}/payments/{paymentId}',
  )
  .onWrite((change, context) => streamToBigQuery('payments', change, context))
