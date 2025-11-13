import * as functions from 'firebase-functions'
import { streamToBigQuery } from './helper'

export const onResidentWritten = functions
  .runWith({})
  .firestore.database('staging-beta')
  .document('providers/{providerId}/residents/{residentId}')
  .onWrite((change, context) => streamToBigQuery('residents', change, context))
