import * as functions from 'firebase-functions'
import { streamToBigQuery } from './helper'

export const onClaimWritten = functions
  .runWith({})
  .firestore.database('staging-beta')
  .document('providers/{providerId}/residents/{residentId}/claims/{claimId}')
  .onWrite((change, context) => streamToBigQuery('claims', change, context))
