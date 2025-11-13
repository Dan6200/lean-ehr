import * as functions from 'firebase-functions'
import { streamToBigQuery } from './helper'

export const onChargeWritten = functions
  .runWith({})
  .firestore.database('staging-beta')
  .document('providers/{providerId}/residents/{residentId}/charges/{chargeId}')
  .onWrite((change, context) => streamToBigQuery('charges', change, context))
