import * as functions from 'firebase-functions'
import { streamToBigQuery } from './helper'

export const onAdjustmentWritten = functions
  .runWith({})
  .firestore.database('staging-beta')
  .document(
    'providers/{providerId}/residents/{residentId}/adjustments/{adjustmentId}',
  )
  .onWrite((change, context) =>
    streamToBigQuery('adjustments', change, context),
  )
